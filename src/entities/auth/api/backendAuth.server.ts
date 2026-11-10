import 'server-only';
import { Headers as CookieHeaders, getSetCookies } from 'undici';

import type {
	AuthUser,
	LoginRequest,
	LoginResponse,
	RefreshResponse,
} from '../model/types/authApi';

export type BackendAuthErrorKind = 'configuration' | 'network' | 'http' | 'protocol';

export interface BackendAuthDiagnostic {
	stage: 'response-body' | 'refresh-cookie';
	path: string;
	expected: string;
	actual: 'null' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'missing';
}

export class BackendAuthError extends Error {
	constructor(
		public readonly kind: BackendAuthErrorKind,
		public readonly status?: number,
		public readonly code?: string,
		public readonly diagnostic?: BackendAuthDiagnostic,
	) {
		super(`Backend auth ${kind} failure${status === undefined ? '' : ` (${status})`}`);
		this.name = 'BackendAuthError';
	}
}

export interface BackendAuthConfig {
	apiOrigin: string;
	allowedOrigins: readonly string[];
	allowLocalHttp?: boolean;
	fetch?: typeof fetch;
}

export type BackendLoginTokens = LoginResponse & { refreshToken: string };

export type BackendAuthTokens = RefreshResponse & { refreshToken: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const category = (value: unknown): BackendAuthDiagnostic['actual'] => {
	if (value === undefined) return 'missing';
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'array';
	if (typeof value === 'string') return 'string';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'boolean') return 'boolean';
	return 'object';
};

const bodyIssue = (path: string, expected: string, value: unknown): BackendAuthDiagnostic => ({
	stage: 'response-body',
	path,
	expected,
	actual: category(value),
});

const userIssue = (value: unknown): BackendAuthDiagnostic | undefined => {
	if (!isObject(value)) return bodyIssue('user', 'object', value);
	for (const key of ['id', 'username', 'email', 'phone', 'updatedAt', 'createdAt']) {
		if (typeof value[key] !== 'string') return bodyIssue(`user.${key}`, 'string', value[key]);
	}
	for (const key of ['country', 'city', 'birthday', 'address', 'avatarUrl']) {
		if (value[key] !== null && typeof value[key] !== 'string')
			return bodyIssue(`user.${key}`, 'string|null', value[key]);
	}
	for (const key of ['isVerified', 'isEmailNotificationsEnable']) {
		if (typeof value[key] !== 'boolean') return bodyIssue(`user.${key}`, 'boolean', value[key]);
	}
	if (!Array.isArray(value.userRoles)) return bodyIssue('user.userRoles', 'array', value.userRoles);
	for (const [roleIndex, role] of value.userRoles.entries()) {
		const path = `user.userRoles[${roleIndex}]`;
		if (!isObject(role)) return bodyIssue(path, 'object', role);
		if (typeof role.id !== 'number') return bodyIssue(`${path}.id`, 'number', role.id);
		if (typeof role.name !== 'string') return bodyIssue(`${path}.name`, 'string', role.name);
		if (!Array.isArray(role.permissions))
			return bodyIssue(`${path}.permissions`, 'array', role.permissions);
		for (const [permissionIndex, permission] of role.permissions.entries()) {
			const permissionPath = `${path}.permissions[${permissionIndex}]`;
			if (!isObject(permission)) return bodyIssue(permissionPath, 'object', permission);
			if (typeof permission.id !== 'number')
				return bodyIssue(`${permissionPath}.id`, 'number', permission.id);
			if (typeof permission.name !== 'string')
				return bodyIssue(`${permissionPath}.name`, 'string', permission.name);
		}
	}
	return undefined;
};

const isUser = (value: unknown): value is AuthUser => userIssue(value) === undefined;

const isToken = (value: unknown): value is string =>
	typeof value === 'string' && /^[A-Za-z0-9._~-]+$/.test(value);

// Diagnostic output contains only fixed schema paths and type categories, never values.
export const diagnoseBackendAuthResponse = (data: unknown): BackendAuthDiagnostic | undefined => {
	if (!isObject(data)) return bodyIssue('$', 'object', data);
	if (!isToken(data.access_token))
		return bodyIssue('access_token', 'nonempty token string', data.access_token);
	return userIssue(data.user);
};

const identityIssue = (value: unknown): BackendAuthDiagnostic | undefined => {
	if (!isObject(value)) return bodyIssue('user', 'object', value);
	for (const key of ['id', 'username']) {
		if (typeof value[key] !== 'string' || !value[key].trim())
			return bodyIssue(`user.${key}`, 'nonempty string', value[key]);
	}
	if (
		value.avatarUrl !== undefined &&
		value.avatarUrl !== null &&
		typeof value.avatarUrl !== 'string'
	)
		return bodyIssue('user.avatarUrl', 'string|null|missing', value.avatarUrl);
	return undefined;
};

const validateOrigin = (value: string, allowLocalHttp: boolean) => {
	try {
		const url = new URL(value);
		const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
		if (
			(url.protocol !== 'https:' && !(allowLocalHttp && local && url.protocol === 'http:')) ||
			url.username ||
			url.password ||
			url.search ||
			url.hash ||
			url.pathname !== '/' ||
			(value !== url.origin && value !== `${url.origin}/`)
		)
			throw new Error();
		return url.origin;
	} catch {
		throw new BackendAuthError('configuration');
	}
};

const getRefreshToken = (response: Response): string => {
	const failure = (path: string, expected: string, actual: BackendAuthDiagnostic['actual']) =>
		new BackendAuthError('protocol', response.status, undefined, {
			stage: 'refresh-cookie',
			path,
			expected,
			actual,
		});
	try {
		if (typeof response.headers.getSetCookie !== 'function')
			throw failure('headers.getSetCookie', 'function', 'missing');
		const headers = new CookieHeaders();
		for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);
		const cookies = getSetCookies(headers).filter((cookie) => cookie.name === 'refresh_token');
		if (cookies.length === 0)
			throw failure('refresh_token', 'single nonempty token cookie', 'missing');
		if (cookies.length !== 1)
			throw failure('refresh_token', 'single nonempty token cookie', 'array');
		if (!isToken(cookies[0].value))
			throw failure('refresh_token', 'nonempty token string', category(cookies[0].value));
		return cookies[0].value;
	} catch (error) {
		if (error instanceof BackendAuthError) throw error;
		throw failure('refresh_token', 'parseable cookie', 'string');
	}
};

export const createBackendAuthTransport = (config: BackendAuthConfig) => {
	const origin = validateOrigin(config.apiOrigin, config.allowLocalHttp === true);
	if (
		!config.allowedOrigins.some(
			(value) => validateOrigin(value, config.allowLocalHttp === true) === origin,
		)
	)
		throw new BackendAuthError('configuration');
	const fetcher = config.fetch ?? fetch;

	const request = async (
		path: '/auth/login' | '/auth/refresh' | '/auth/profile' | '/auth/logout',
		method: 'GET' | 'POST',
		headers: Record<string, string>,
		sensitive: string[],
		body?: string,
	) => {
		let response: Response;
		try {
			response = await fetcher(`${origin}${path}`, {
				method,
				headers,
				body,
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
			});
		} catch {
			throw new BackendAuthError('network');
		}
		if (response.status >= 300 && response.status < 400) {
			throw new BackendAuthError('http', response.status);
		}
		let data: unknown;
		try {
			const text = await response.text();
			data = text ? JSON.parse(text) : undefined;
		} catch {
			if (!response.ok) throw new BackendAuthError('http', response.status);
			throw new BackendAuthError(
				'protocol',
				response.status,
				undefined,
				bodyIssue('$', 'valid JSON', ''),
			);
		}
		if (!response.ok) {
			const message = isObject(data) ? data.message : undefined;
			const code =
				typeof message === 'string' &&
				/^(auth|user)\.[a-z0-9_.]{1,120}$/.test(message) &&
				!sensitive.some((secret) => secret && message.includes(secret))
					? message
					: undefined;
			throw new BackendAuthError('http', response.status, code);
		}
		return { response, data };
	};

	const tokens = ({ response, data }: { response: Response; data: unknown }): BackendAuthTokens => {
		const diagnostic = !isObject(data)
			? bodyIssue('$', 'object', data)
			: !isToken(data.access_token)
				? bodyIssue('access_token', 'nonempty token string', data.access_token)
				: identityIssue(data.user);
		if (diagnostic) throw new BackendAuthError('protocol', response.status, undefined, diagnostic);
		// Narrow unknown input explicitly and return only the validated identity fields.
		if (
			!isObject(data) ||
			!isToken(data.access_token) ||
			!isObject(data.user) ||
			typeof data.user.id !== 'string' ||
			typeof data.user.username !== 'string' ||
			(data.user.avatarUrl != null && typeof data.user.avatarUrl !== 'string')
		)
			throw new BackendAuthError('protocol', response.status);
		return {
			access_token: data.access_token,
			user: {
				id: data.user.id,
				username: data.user.username,
				avatarUrl: data.user.avatarUrl ?? null,
			},
			refreshToken: getRefreshToken(response),
		};
	};

	const bearer = (token: string) => {
		if (!isToken(token)) throw new BackendAuthError('configuration');
		return { Authorization: `Bearer ${token}` };
	};

	return {
		login: async (input: LoginRequest): Promise<BackendLoginTokens> => {
			const { response, data } = await request(
				'/auth/login',
				'POST',
				{ 'Content-Type': 'application/json' },
				[input.username, input.password],
				JSON.stringify({ username: input.username, password: input.password }),
			);
			return tokens({ response, data });
		},
		refresh: async (refreshToken: string): Promise<BackendAuthTokens> => {
			if (!isToken(refreshToken)) throw new BackendAuthError('configuration');
			return tokens(
				await request('/auth/refresh', 'GET', { Cookie: `refresh_token=${refreshToken}` }, [
					refreshToken,
				]),
			);
		},
		profile: async (accessToken: string): Promise<AuthUser> => {
			const { response, data } = await request('/auth/profile', 'GET', bearer(accessToken), [
				accessToken,
			]);
			if (!isUser(data)) throw new BackendAuthError('protocol', response.status);
			return data;
		},
		logout: async (accessToken: string): Promise<void> => {
			await request('/auth/logout', 'GET', bearer(accessToken), [accessToken]);
		},
	};
};
