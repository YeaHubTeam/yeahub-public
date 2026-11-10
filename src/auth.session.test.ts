/** @jest-environment node */
import { NextRequest } from 'next/server';

import { encode, getToken } from 'next-auth/jwt';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';

import { auth, handlers } from './auth';
import { createAuthRefreshCoordinator, refreshAuthCredentials } from './lib/authRefresh.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('next/headers', () => ({ headers: jest.fn(() => Promise.resolve(requestHeaders)) }));
jest.mock('@/shared/config/authBackend.server', () => ({
	getAuthBackendConfig: jest.fn(() => ({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
	})),
}));
jest.mock('@/entities/auth/server', () => ({
	BackendAuthError: class extends Error {
		constructor(
			public kind: string,
			public status?: number,
		) {
			super('Synthetic backend failure');
		}
	},
	createBackendAuthTransport: jest.fn(),
}));

jest.mock('./lib/authRefresh.server', () => ({
	...jest.requireActual('./lib/authRefresh.server'),
	refreshAuthCredentials: jest.fn(),
}));

let requestHeaders = new Headers();
const now = 1_800_000_000;
const token = (exp: number) =>
	`synthetic.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const login = jest.fn();
const refresh = jest.fn();
const profile = jest.fn();
const logout = jest.fn();
const origin = 'https://site.example';
const password = 'synthetic-password';
const sessionCookieName = '__Secure-authjs.session-token';
let logs: jest.SpyInstance[];
let expectedRefreshCalls = 0;
let issuedCookies: string[] = [];
let originalEnvironment: NodeJS.ProcessEnv;

// Keep cookies in memory, including Auth.js chunked cookies, without printing them.
const cookiesFrom = (response: Response) =>
	response.headers
		.getSetCookie()
		.map((value) => value.split(';', 1)[0])
		.join('; ');
const signIn = async () => {
	const csrfResponse = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`));
	const { csrfToken } = await csrfResponse.json();
	const response = await handlers.POST(
		new NextRequest(`${origin}/api/auth/callback/credentials`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				cookie: cookiesFrom(csrfResponse),
			},
			body: new URLSearchParams({
				csrfToken,
				username: 'sample',
				password,
				callbackUrl: `${origin}/ru`,
			}),
		}),
	);
	expect(response.status).toBe(302);
	const cookie = cookiesFrom(response);
	expect(
		cookie.includes(`${sessionCookieName}=`) || cookie.includes(`${sessionCookieName}.0=`),
	).toBe(true);
	issuedCookies.push(cookie);
	return cookie;
};
const restore = async (cookie = '') => {
	// A fresh request header collection exercises the RSC auth() overload.
	requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
	return auth();
};

const updateSession = async (cookie: string, data: object = {}) => {
	const csrf = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`));
	const { csrfToken } = await csrf.json();
	return handlers.POST(
		new NextRequest(`${origin}/api/auth/session`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', cookie: `${cookie}; ${cookiesFrom(csrf)}` },
			body: JSON.stringify({ csrfToken, data }),
		}),
	);
};
const decodeSession = (cookie: string) =>
	getToken({
		req: new Request(origin, { headers: { cookie } }),
		secret: process.env.AUTH_SECRET!,
		secureCookie: true,
	});

beforeEach(() => {
	originalEnvironment = process.env;
	process.env = {
		NODE_ENV: 'test',
		AUTH_SECRET: 'synthetic-test-secret-at-least-thirty-two-characters',
		AUTH_TRUST_HOST: 'true',
		AUTH_URL: origin,
	};
	jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(now * 1000);
	requestHeaders = new Headers();
	issuedCookies = [];
	login.mockReset();
	login.mockResolvedValue({
		access_token: token(now + 3600),
		refreshToken: token(now + 7200),
		user: { id: 'user-id', username: 'sample', avatarUrl: 'https://images.example/avatar' },
	});
	refresh.mockReset();
	expectedRefreshCalls = 0;
	jest.mocked(refreshAuthCredentials).mockImplementation(createAuthRefreshCoordinator({ refresh }));
	profile.mockReset();
	logout.mockReset();
	jest.mocked(createBackendAuthTransport).mockReturnValue({ login, refresh, profile, logout });
	jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'));
	logs = [
		jest.spyOn(console, 'error').mockImplementation(() => {}),
		jest.spyOn(console, 'warn').mockImplementation(() => {}),
		jest.spyOn(console, 'log').mockImplementation(() => {}),
	];
});
afterEach(() => {
	try {
		expect(refresh).toHaveBeenCalledTimes(expectedRefreshCalls);
		expect(profile).not.toHaveBeenCalled();
		expect(logout).not.toHaveBeenCalled();
		expect(globalThis.fetch).not.toHaveBeenCalled();
		const logged = logs
			.flatMap((spy) => spy.mock.calls)
			.map((args) => args.map(String).join(' '))
			.join('\n');
		for (const cookie of issuedCookies) {
			for (const pair of cookie.split('; ')) {
				const value = pair.slice(pair.indexOf('=') + 1);
				if (value) expect(logged.includes(value)).toBe(false);
			}
		}
		for (const secret of [
			password,
			token(now + 3600),
			token(now + 7200),
			token(now + 10000),
			token(now + 20000),
			'damaged-cookie-value',
		])
			expect(logged.includes(secret)).toBe(false);
	} finally {
		process.env = originalEnvironment;
		jest.restoreAllMocks();
		jest.clearAllTimers();
		jest.useRealTimers();
	}
});

describe('real Auth.js encrypted session restoration', () => {
	it('logs in through Credentials and restores a safe session on independent requests', async () => {
		const cookie = await signIn();
		const first = await restore(cookie);
		const second = await restore(cookie);
		expect(first).toEqual({
			user: { id: 'user-id', username: 'sample', image: 'https://images.example/avatar' },
			expires: new Date((now + 7200) * 1000).toISOString(),
			requiresRefresh: false,
		});
		expect(second).toEqual(first);
		const serialized = JSON.stringify(second);
		for (const forbidden of [
			'accessToken',
			'refreshToken',
			'password',
			'backendSession',
			token(now + 3600),
			token(now + 7200),
		])
			expect(serialized.includes(forbidden)).toBe(false);
		expect(login).toHaveBeenCalledTimes(1);
		expect(login).toHaveBeenCalledWith({ username: 'sample', password });
		expect(logs.every((spy) => spy.mock.calls.length === 0)).toBe(true);
	});
	it('returns null without a cookie', async () => {
		expect(await restore()).toBeNull();
		expect(login).not.toHaveBeenCalled();
	});
	it('rejects a damaged cookie', async () => {
		expect(await restore(`${sessionCookieName}=damaged-cookie-value`)).toBeNull();
		expect(login).not.toHaveBeenCalled();
	});
	it('preserves a refreshable session after access expiry, then stops at refresh expiry', async () => {
		const cookie = await signIn();
		jest.setSystemTime((now + 3599) * 1000);
		expect(await restore(cookie)).not.toBeNull();
		jest.setSystemTime((now + 3600) * 1000);
		expect(await restore(cookie)).toMatchObject({ requiresRefresh: true });
		jest.setSystemTime((now + 7200) * 1000);
		expect(await restore(cookie)).toBeNull();
	});
	it('retains the absolute deadline across rolling session reads', async () => {
		login.mockResolvedValue({
			access_token: token(now + 172800),
			refreshToken: token(now + 864000),
			user: { id: 'user-id', username: 'sample', avatarUrl: null },
		});
		const cookie = await signIn();
		jest.setSystemTime((now + 604799) * 1000);
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		// The real session endpoint renews the encrypted cookie before the absolute cutoff.
		const renewed = await handlers.GET(
			new NextRequest(`${origin}/api/auth/session`, { headers: requestHeaders }),
		);
		expect((await renewed.json()).user.id).toBe('user-id');
		jest.setSystemTime((now + 604800) * 1000);
		expect(await restore(cookiesFrom(renewed))).toBeNull();
	});
	it('bounds encrypted JWT expiry and keeps a new session readable beyond day one', async () => {
		login.mockResolvedValue({
			access_token: token(now + 86400),
			refreshToken: token(now + 604800),
			user: { id: 'user-id', username: 'sample', avatarUrl: null },
		});
		const cookie = await signIn();
		const decoded = await getToken({
			req: new Request(origin, { headers: { cookie } }),
			secret: process.env.AUTH_SECRET!,
			secureCookie: true,
		});
		expect(decoded?.exp).toBe(now + 604800);
		jest.setSystemTime((now + 172800) * 1000);
		expect(await restore(cookie)).toMatchObject({
			requiresRefresh: true,
			expires: new Date((now + 604800) * 1000).toISOString(),
		});
	});
	it('preserves the absolute cutoff in an old encrypted cookie', async () => {
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			maxAge: 86400,
			token: {
				sub: 'user-id',
				backendSession: {
					userId: 'user-id',
					username: 'sample',
					avatarUrl: null,
					accessToken: token(now + 3600),
					refreshToken: token(now + 7200),
					accessExpiresAt: now + 3600,
					refreshExpiresAt: now + 7200,
					sessionExpiresAt: now + 3600,
				},
			},
		});
		const cookie = `${sessionCookieName}=${value}`;
		issuedCookies.push(cookie);
		jest.setSystemTime((now + 3599) * 1000);
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		const renewed = await handlers.GET(
			new NextRequest(`${origin}/api/auth/session`, { headers: requestHeaders }),
		);
		const newCookie = cookiesFrom(renewed);
		const decoded = await getToken({
			req: new Request(origin, { headers: { cookie: newCookie } }),
			secret: process.env.AUTH_SECRET!,
			secureCookie: true,
		});
		expect(decoded?.exp).toBe(now + 3600);
		jest.setSystemTime((now + 3600) * 1000);
		expect(await restore(newCookie)).toBeNull();
	});
	it('ignores client deadline and credential injection through real session update', async () => {
		const cookie = await signIn();
		const csrfResponse = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`));
		const { csrfToken } = await csrfResponse.json();
		const updated = await handlers.POST(
			new NextRequest(`${origin}/api/auth/session`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					cookie: `${cookie}; ${cookiesFrom(csrfResponse)}`,
				},
				body: JSON.stringify({
					csrfToken,
					data: {
						backendSession: {
							userId: 'injected-user',
							accessToken: 'injected-token',
							refreshToken: 'injected-token',
							accessExpiresAt: now + 999999,
							refreshExpiresAt: now + 999999,
							sessionExpiresAt: now + 999999,
						},
					},
				}),
			}),
		);
		expect(updated.status).toBe(200);
		expect(await updated.json()).toMatchObject({
			user: { id: 'user-id' },
			expires: new Date((now + 7200) * 1000).toISOString(),
		});
		const newCookie = cookiesFrom(updated);
		const decoded = await getToken({
			req: new Request(origin, { headers: { cookie: newCookie } }),
			secret: process.env.AUTH_SECRET!,
			secureCookie: true,
		});
		expect(decoded?.exp).toBe(now + 7200);
		expect(JSON.stringify(decoded).includes('injected')).toBe(false);
	});
	it.each([3540, 3601])(
		'rotates via writable session at offset %s and persists new credentials',
		async (offset) => {
			const cookie = await signIn();
			jest.setSystemTime((now + offset) * 1000);
			expect(await restore(cookie)).not.toBeNull();
			expect(refresh).not.toHaveBeenCalled();
			expectedRefreshCalls = 1;
			refresh.mockResolvedValue({
				access_token: token(now + 10000),
				refreshToken: token(now + 20000),
				user: { id: 'user-id', username: 'updated-name', avatarUrl: null },
			});
			const response = await updateSession(cookie, {
				backendSession: {
					userId: 'injected',
					accessToken: 'injected',
					refreshToken: 'injected',
					sessionExpiresAt: now + 999999,
				},
			});
			expect(response.status).toBe(200);
			const output = await response.json();
			expect(output).toEqual({
				user: { id: 'user-id', username: 'updated-name', image: null },
				expires: new Date((now + 7200) * 1000).toISOString(),
				requiresRefresh: false,
			});
			expect(JSON.stringify(output)).not.toMatch(
				/backendSession|accessToken|refreshToken|password|synthetic|injected/,
			);
			const renewed = cookiesFrom(response);
			issuedCookies.push(renewed);
			const decoded = await decodeSession(renewed);
			expect(decoded?.backendSession).toMatchObject({
				userId: 'user-id',
				accessToken: token(now + 10000),
				refreshToken: token(now + 20000),
				sessionExpiresAt: now + 7200,
			});
			expect(decoded?.exp).toBe(now + 7200);
			expect(await restore(renewed)).toEqual(output);
			// An independent request carrying the old cookie reuses the coordinator result.
			const duplicate = await updateSession(cookie);
			expect((await duplicate.json()).requiresRefresh).toBe(false);
			expect(refresh).toHaveBeenCalledWith(token(now + 7200));
		},
	);
	it('does not rotate on writable reads outside the refresh window', async () => {
		const cookie = await signIn();
		jest.setSystemTime((now + 3539) * 1000);
		const response = await updateSession(cookie);
		expect((await response.json()).requiresRefresh).toBe(false);
	});
	it.each(['unauthorized', 'identity', 'protocol', 'invalid-expiry'] as const)(
		'fails closed on %s and clears the session cookie',
		async (failure) => {
			const cookie = await signIn();
			jest.setSystemTime((now + 3601) * 1000);
			expectedRefreshCalls = 1;
			if (failure === 'invalid-expiry')
				refresh.mockResolvedValue({
					access_token: 'synthetic-invalid-jwt',
					refreshToken: token(now + 20000),
					user: { id: 'user-id', username: 'sample', avatarUrl: null },
				});
			else if (failure === 'identity')
				refresh.mockResolvedValue({
					access_token: token(now + 10000),
					refreshToken: token(now + 20000),
					user: { id: 'other-user', username: 'other', avatarUrl: null },
				});
			else
				refresh.mockRejectedValue(
					new BackendAuthError(
						failure === 'unauthorized' ? 'http' : 'protocol',
						failure === 'unauthorized' ? 401 : 200,
					),
				);
			const response = await updateSession(cookie);
			expect(await response.json()).toBeNull();
			expect(
				response.headers
					.getSetCookie()
					.some(
						(value) => value.startsWith(`${sessionCookieName}=`) && value.includes('Max-Age=0'),
					),
			).toBe(true);
			expect(await restore(cookiesFrom(response))).toBeNull();
			expect(logs.every((spy) => spy.mock.calls.length === 0)).toBe(true);
		},
	);
	it.each([
		['network', undefined, 3540],
		['http', 503, 3540],
		['network', undefined, 3601],
		['http', 503, 3601],
	] as const)(
		'preserves credentials on temporary %s/%s at %s without retry',
		async (kind, status, offset) => {
			const cookie = await signIn();
			jest.setSystemTime((now + offset) * 1000);
			expectedRefreshCalls = 1;
			refresh.mockRejectedValue(new BackendAuthError(kind, status));
			const response = await updateSession(cookie);
			const output = await response.json();
			expect(output).toMatchObject({
				user: { id: 'user-id' },
				requiresRefresh: true,
				expires: new Date((now + 7200) * 1000).toISOString(),
			});
			const renewed = cookiesFrom(response);
			const decoded = await decodeSession(renewed);
			expect(decoded?.backendSession).toMatchObject({
				accessToken: token(now + 3600),
				refreshToken: token(now + 7200),
				sessionExpiresAt: now + 7200,
				refreshRetryRequired: true,
			});
			expect(await restore(renewed)).toEqual(output);
			expect(logs.every((spy) => spy.mock.calls.length === 0)).toBe(true);
		},
	);
	it('does not rotate an expired access token without a verified CSRF update', async () => {
		const cookie = await signIn();
		jest.setSystemTime((now + 3601) * 1000);
		const response = await handlers.POST(
			new NextRequest(`${origin}/api/auth/session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', cookie },
				body: JSON.stringify({ data: { requiresRefresh: true } }),
			}),
		);
		expect(await response.json()).toBeNull();
		expect(refresh).not.toHaveBeenCalled();
	});
});
