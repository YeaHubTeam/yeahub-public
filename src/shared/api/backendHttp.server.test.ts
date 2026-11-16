/** @jest-environment node */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { backendHttp } from './index.server';
import type { BackendHttpOptions } from './index.server';

jest.mock('server-only', () => ({}), { virtual: true });

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const config = {
	apiOrigin: 'https://backend.example.invalid',
	allowedOrigins: ['https://backend.example.invalid'],
};
const options = (): BackendHttpOptions<unknown> => ({
	config,
	path: '/subscriptions',
	method: 'GET',
	effect: 'read',
	cache: 'no-store',
	timeoutMs: 5000,
	decode: async (response) => response.json(),
});
beforeEach(() => {
	jest.useFakeTimers();
	fetchMock.mockReset();
	globalThis.fetch = fetchMock;
});
afterEach(() => {
	expect(jest.getTimerCount()).toBe(0);
	globalThis.fetch = originalFetch;
	jest.useRealTimers();
});

it('preserves a same-origin encoded query and passes only explicit fetch settings', async () => {
	fetchMock.mockResolvedValue(new Response('[]'));
	const result = await backendHttp({
		...options(),
		path: '/subscriptions?email=synthetic%2Btag%40example.invalid&code=month&code=year',
	});
	expect(result).toEqual({ status: 'response', value: [] });
	expect(fetchMock).toHaveBeenCalledTimes(1);
	const [url, init] = fetchMock.mock.calls[0];
	expect((url as URL).href).toBe(
		'https://backend.example.invalid/subscriptions?email=synthetic%2Btag%40example.invalid&code=month&code=year',
	);
	expect(init).toEqual({
		method: 'GET',
		cache: 'no-store',
		body: undefined,
		headers: expect.any(Headers),
		redirect: 'manual',
		credentials: 'omit',
		signal: expect.any(AbortSignal),
	});
	expect(new Headers(init?.headers).has('cookie')).toBe(false);
	expect(init?.signal?.aborted).toBe(false);
});

it.each([
	'https://external.example.invalid/subscriptions',
	'//external.example.invalid/path',
	'subscriptions',
	'/\\external.example.invalid',
	'/a/../subscriptions',
	'/a/./b',
	'/%2e%2e/subscriptions',
	'/a%2fb',
	'/a%5cb',
	'/%252e%252e/path',
	'/a#fragment',
	'/a b',
	'/a\nb',
	'/%00',
	'/%',
	'/%zz',
])('rejects unsafe path %j before fetch', async (path) => {
	expect(await backendHttp({ ...options(), path })).toEqual({
		status: 'error',
		kind: 'configuration',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([
	{ apiOrigin: 'https://external.example.invalid', allowedOrigins: config.allowedOrigins },
	{
		apiOrigin: 'https://backend.example.invalid/base',
		allowedOrigins: ['https://backend.example.invalid/base'],
	},
	{
		apiOrigin: 'https://name:secret@backend.example.invalid',
		allowedOrigins: ['https://name:secret@backend.example.invalid'],
	},
	{ apiOrigin: 'file:///tmp/data', allowedOrigins: ['file:///tmp/data'] },
])('rejects invalid or unapproved config without exposing input', async (badConfig) => {
	const result = await backendHttp({ ...options(), config: badConfig });
	expect(result).toEqual({ status: 'error', kind: 'configuration' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([301, 302, 303, 307, 308])(
	'refuses redirect %i without following Location or decoding',
	async (status) => {
		const decode = jest.fn();
		fetchMock.mockResolvedValue(
			new Response(null, {
				status,
				headers: { Location: 'https://external.example.invalid/secret' },
			}),
		);
		expect(await backendHttp({ ...options(), decode })).toEqual({
			status: 'error',
			kind: 'redirect',
		});
		expect(decode).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][1]?.redirect).toBe('manual');
	},
);

it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)(
	'sends one explicit %s with no retry or refresh',
	async (method) => {
		fetchMock.mockResolvedValue(new Response('ok', { status: 201 }));
		const result = await backendHttp({
			...options(),
			method,
			effect: 'mutation',
			cache: 'no-store',
			body: method === 'GET' ? undefined : '{"value":1}',
			decode: async (response) => response.text(),
		});
		expect(result).toEqual({ status: 'response', value: 'ok' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][1]).toMatchObject({ method, cache: 'no-store' });
		expect(fetchMock.mock.calls[0][1]?.body).toBe(method === 'GET' ? undefined : '{"value":1}');
	},
);
it.each(['no-store', 'force-cache', 'no-cache', 'default', 'reload', 'only-if-cached'] as const)(
	'preserves explicit cache %s',
	async (cache) => {
		fetchMock.mockResolvedValue(new Response('null'));
		await backendHttp({ ...options(), cache });
		expect(fetchMock.mock.calls[0][1]?.cache).toBe(cache);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	},
);
it('forwards allowed server headers but does not include them in its result', async () => {
	fetchMock.mockResolvedValue(new Response('null'));
	const headers = {
		Authorization: 'Bearer synthetic-token',
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};
	expect(await backendHttp({ ...options(), headers })).toEqual({ status: 'response', value: null });
	const sent = new Headers(fetchMock.mock.calls[0][1]?.headers);
	for (const [key, value] of Object.entries(headers)) expect(sent.get(key)).toBe(value);
	expect([...sent.keys()].sort()).toEqual(['accept', 'authorization', 'content-type']);
});
it.each(['Cookie', 'Set-Cookie', 'Host', 'Connection', 'Proxy-Authorization', 'X-Forwarded-Host'])(
	'rejects disallowed header %s',
	async (name) => {
		expect(await backendHttp({ ...options(), headers: { [name]: 'synthetic-secret' } })).toEqual({
			status: 'error',
			kind: 'configuration',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('rejects CRLF header injection before fetch', async () => {
	expect(
		await backendHttp({
			...options(),
			headers: { Authorization: 'Bearer synthetic\r\nCookie: secret' },
		}),
	).toEqual({ status: 'error', kind: 'configuration' });
	expect(fetchMock).not.toHaveBeenCalled();
});

it.each([0, -1, 1.5, NaN, Infinity, 2147483648])(
	'rejects invalid timeout %s',
	async (timeoutMs) => {
		expect(await backendHttp({ ...options(), timeoutMs })).toEqual({
			status: 'error',
			kind: 'configuration',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it.each([
	{ method: 'TRACE' },
	{ method: undefined },
	{ effect: 'read-write' },
	{ cache: 'unsafe' },
	{ timeoutMs: '5000' },
	{ body: 42 },
	{ headers: { Accept: 42 } },
	{ effect: undefined },
	{ cache: undefined },
	{ decode: undefined },
	{ body: 'not allowed for GET' },
])('rejects missing or invalid explicit settings %j', async (invalid) => {
	expect(await backendHttp({ ...options(), ...invalid } as BackendHttpOptions<unknown>)).toEqual({
		status: 'error',
		kind: 'configuration',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});
it('bounds a fetch that never produces headers, aborts and skips a late decoder', async () => {
	let resolve!: (response: Response) => void;
	fetchMock.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const decode = jest.fn();
	const pending = backendHttp({ ...options(), decode });
	expect(jest.getTimerCount()).toBe(1);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error', kind: 'timeout' });
	expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
	resolve(new Response('[]'));
	await Promise.resolve();
	expect(decode).not.toHaveBeenCalled();
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('retains the deadline while a body decoder is pending and ignores its late completion', async () => {
	let resolve!: (value: unknown) => void;
	const decode = jest.fn(
		() =>
			new Promise((done) => {
				resolve = done;
			}),
	);
	fetchMock.mockResolvedValue(new Response('[]'));
	const pending = backendHttp({ ...options(), decode });
	await Promise.resolve();
	expect(decode).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(1);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error', kind: 'timeout' });
	expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
	resolve('late body');
	await Promise.resolve();
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('keeps timeout classification when abort rejects fetch', async () => {
	fetchMock.mockImplementation(
		(_url, init) =>
			new Promise((_resolve, reject) => {
				init?.signal?.addEventListener('abort', () => reject(new Error('synthetic abort detail')));
			}),
	);
	const pending = backendHttp(options());
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error', kind: 'timeout' });
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('decodes empty 204 without attempting JSON', async () => {
	const response = new Response(null, { status: 204 });
	const json = jest.spyOn(response, 'json');
	fetchMock.mockResolvedValue(response);
	expect(
		await backendHttp({
			...options(),
			decode: (value) => Promise.resolve({ status: value.status }),
		}),
	).toEqual({ status: 'response', value: { status: 204 } });
	expect(json).not.toHaveBeenCalled();
});
it.each([200, 201, 204, 400, 401, 403, 404, 409, 429, 500, 502, 503])(
	'leaves exact HTTP %i and domain outcomes to the decoder',
	async (status) => {
		fetchMock.mockResolvedValue(new Response(null, { status }));
		expect(
			await backendHttp({
				...options(),
				decode: (response) => Promise.resolve({ status: response.status, domain: 'not-confirmed' }),
			}),
		).toEqual({ status: 'response', value: { status, domain: 'not-confirmed' } });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	},
);
it('classifies malformed JSON as decode failure and cleans up', async () => {
	fetchMock.mockResolvedValue(new Response('{broken'));
	expect(await backendHttp(options())).toEqual({ status: 'error', kind: 'decode' });
	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
});
it.each([false, true])(
	'sanitizes network failure, including synchronous throw: %s',
	async (sync) => {
		const error = new Error(
			'https://backend.example.invalid?email=synthetic-secret Bearer synthetic-token',
		);
		if (sync)
			fetchMock.mockImplementation(() => {
				throw error;
			});
		else fetchMock.mockRejectedValue(error);
		expect(await backendHttp(options())).toEqual({ status: 'error', kind: 'network' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	},
);
it('does not log sensitive decode errors or return their cause', async () => {
	const log = jest.spyOn(console, 'log').mockImplementation(() => {});
	const error = jest.spyOn(console, 'error').mockImplementation(() => {});
	const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
	try {
		fetchMock.mockResolvedValue(new Response('secret'));
		expect(
			await backendHttp({
				...options(),
				decode: () => Promise.reject(new Error('synthetic-secret')),
			}),
		).toEqual({ status: 'error', kind: 'decode' });
		expect(log).not.toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
		expect(warn).not.toHaveBeenCalled();
	} finally {
		log.mockRestore();
		error.mockRestore();
		warn.mockRestore();
	}
});
it('exposes a separate server-only entrypoint and leaves the client entrypoint untouched', () => {
	const server = readFileSync(join(__dirname, 'index.server.ts'), 'utf8');
	const implementation = readFileSync(join(__dirname, 'backendHttp.server.ts'), 'utf8');
	const client = readFileSync(join(__dirname, 'index.ts'), 'utf8');
	expect(server).toContain("import 'server-only'");
	expect(implementation).toContain("import 'server-only'");
	expect(client).not.toMatch(/backendHttp|index\.server|server-only/);
});
