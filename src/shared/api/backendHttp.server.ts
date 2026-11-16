import 'server-only';

export type BackendHttpResult<T> =
	| { status: 'response'; value: T }
	| { status: 'error'; kind: 'configuration' | 'network' | 'timeout' | 'decode' | 'redirect' };

export type BackendHttpOptions<T> = {
	config: { apiOrigin: string; allowedOrigins: readonly string[] };
	/** Root-relative backend path, including an optional encoded query. */
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	/** GET can be a mutation. This metadata never enables retry or caching. */
	effect: 'read' | 'mutation';
	cache: RequestCache;
	timeoutMs: number;
	/** Only Accept, Content-Type and Authorization are supported. */
	headers?: Readonly<Record<string, string>>;
	body?: string;
	/** Runs inside the request deadline; HTTP statuses belong to the domain. */
	decode: (response: Response) => Promise<T>;
};

const containsControl = (value: string) =>
	[...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

const validateBackendOrigin = (config: BackendHttpOptions<unknown>['config']) => {
	const origin = new URL(config.apiOrigin);
	if (
		origin.origin !== config.apiOrigin ||
		!['https:', 'http:'].includes(origin.protocol) ||
		!config.allowedOrigins.includes(origin.origin)
	)
		throw new Error();
	return origin;
};

const buildRequestUrl = (path: string, origin: URL) => {
	if (
		typeof path !== 'string' ||
		!path.startsWith('/') ||
		path.startsWith('//') ||
		/[\\#\s]/.test(path) ||
		containsControl(path)
	)
		throw new Error();
	// Reject traversal, encoded separators and double-encoding before URL normalization.
	for (const segment of path.split('?')[0].split('/')) {
		const decoded = decodeURIComponent(segment);
		if (
			decoded === '.' ||
			decoded === '..' ||
			/[/\\?#%\s]/.test(decoded) ||
			containsControl(decoded)
		)
			throw new Error();
	}
	const url = new URL(path, origin);
	if (url.origin !== origin.origin) throw new Error();
	return url;
};

const validateHttpOptions = <T>({ method, effect, cache, decode }: BackendHttpOptions<T>) => {
	if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) throw new Error();
	if (!['read', 'mutation'].includes(effect)) throw new Error();
	if (
		!['default', 'no-store', 'reload', 'no-cache', 'force-cache', 'only-if-cached'].includes(cache)
	)
		throw new Error();
	if (typeof decode !== 'function') throw new Error();
};

const validateTimeout = (timeoutMs: number) => {
	if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647)
		throw new Error();
};

const validateHeadersAndBody = <T>({ headers, body, method }: BackendHttpOptions<T>) => {
	if (body !== undefined && (typeof body !== 'string' || method === 'GET')) throw new Error();
	const safeHeaders = new Headers();
	for (const [key, value] of Object.entries(headers ?? {})) {
		if (
			!['accept', 'content-type', 'authorization'].includes(key.toLowerCase()) ||
			typeof value !== 'string' ||
			containsControl(value)
		)
			throw new Error();
		safeHeaders.set(key, value);
	}
	return safeHeaders;
};

const prepareRequest = <T>(options: BackendHttpOptions<T>) => {
	const origin = validateBackendOrigin(options.config);
	const url = buildRequestUrl(options.path, origin);
	validateHttpOptions(options);
	validateTimeout(options.timeoutMs);
	return { url, headers: validateHeadersAndBody(options) };
};

export const backendHttp = async <T>(
	options: BackendHttpOptions<T>,
): Promise<BackendHttpResult<T>> => {
	let prepared: ReturnType<typeof prepareRequest<T>>;
	try {
		prepared = prepareRequest(options);
	} catch {
		return { status: 'error', kind: 'configuration' };
	}
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const timeout = new Promise<BackendHttpResult<T>>((resolve) => {
			timer = setTimeout(() => {
				resolve({ status: 'error', kind: 'timeout' });
				controller.abort();
			}, options.timeoutMs);
		});
		const request = async (): Promise<BackendHttpResult<T>> => {
			let response: Response;
			try {
				response = await fetch(prepared.url, {
					method: options.method,
					cache: options.cache,
					body: options.body,
					headers: prepared.headers,
					redirect: 'manual',
					credentials: 'omit',
					signal: controller.signal,
				});
			} catch {
				return { status: 'error', kind: 'network' };
			}
			if (controller.signal.aborted) return { status: 'error', kind: 'timeout' };
			if (response.status >= 300 && response.status < 400)
				return { status: 'error', kind: 'redirect' };
			try {
				return { status: 'response', value: await options.decode(response) };
			} catch {
				return { status: 'error', kind: 'decode' };
			}
		};
		return await Promise.race([request(), timeout]);
	} finally {
		clearTimeout(timer);
	}
};
