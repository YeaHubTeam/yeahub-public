/** @jest-environment node */
import { cookies as nextCookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { encode, getToken } from 'next-auth/jwt';
import { AsyncLocalStorage } from 'node:async_hooks';
import { deflateSync } from 'node:zlib';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';

import {
	auth,
	cancelOwnSettingsSubscription,
	changeOwnPassword,
	createOwnSettingsProfile,
	deleteOwnSettingsAccount,
	deleteOwnSettingsProfile,
	getHeaderProfile,
	getOwnProfile,
	getSettingsPageData,
	getSettingsPaymentHistory,
	getSettingsSnapshot,
	handlers,
	initializeOwnSettingsPayment,
	linkOwnTelegram,
	mutateOwnAvatar,
	mutateOwnProfile,
	selectOwnSettingsProfile,
	sendOwnVerificationEmail,
	startOwnSettingsTrial,
	unlinkOwnTelegram,
} from './auth';
import { createAuthRefreshCoordinator, refreshAuthCredentials } from './lib/authRefresh.server';

jest.mock('next-auth/jwt', () => {
	const actual = jest.requireActual('next-auth/jwt');
	return {
		...actual,
		encode: jest.fn((args: unknown) => {
			if (failEncoding) throw new Error('Synthetic encoding failure');
			return actual.encode(args);
		}),
	};
});

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('next/headers', () => ({
	headers: jest.fn(() =>
		Promise.resolve(passwordTestContext.getStore()?.headers ?? requestHeaders),
	),
	cookies: jest.fn(() =>
		Promise.resolve({
			set: (name: string, value: string) => {
				if (!writableCookies) throw new Error('Read-only cookie context');
				if (!dropCookieWrites)
					(passwordTestContext.getStore()?.writes ?? cookieWrites).push({ name, value });
			},
			getAll: () => {
				const current = passwordTestContext.getStore();
				const values = new Map(
					(current?.headers ?? requestHeaders)
						.get('cookie')
						?.split('; ')
						.filter(Boolean)
						.map((pair) => {
							const index = pair.indexOf('=');
							return [pair.slice(0, index), pair.slice(index + 1)];
						}) ?? [],
				);
				for (const { name, value } of current?.writes ?? cookieWrites) {
					if (value) values.set(name, value);
					else values.delete(name);
				}
				return [...values].map(([name, value]) => ({ name, value }));
			},
		}),
	),
}));
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

const passwordTestContext = new AsyncLocalStorage<{
	headers: Headers;
	writes: { name: string; value: string }[];
}>();
let failEncoding = false;
let dropCookieWrites = false;
const changePasswordTransport = jest.fn();
let expectedPasswordCalls = 0;
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
let expectedLogoutCalls = 0;
let expectedProfileFetchCalls = 0;
const expectRequestHeaders = (index: number, expected: Record<string, string>) => {
	const options = jest.mocked(globalThis.fetch).mock.calls[index][1];
	const headers = new Headers(options?.headers);
	expect([...headers.entries()]).toEqual([...new Headers(expected).entries()]);
	expect(headers.has('Cookie')).toBe(false);
	expect(options?.cache).toBe('no-store');
	expect(options?.redirect).toBe('manual');
	expect(options?.credentials).toBe('omit');
};

let expectedProfileCalls = 0;
let writableCookies = true;
let cookieWrites: { name: string; value: string }[] = [];
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
	failEncoding = false;
	dropCookieWrites = false;
	expectedPasswordCalls = 0;
	changePasswordTransport.mockReset();
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
	expectedLogoutCalls = 0;
	expectedProfileFetchCalls = 0;
	expectedProfileCalls = 0;
	writableCookies = true;
	cookieWrites = [];
	jest
		.mocked(createBackendAuthTransport)
		.mockReturnValue({ login, refresh, profile, logout, changePassword: changePasswordTransport });
	jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'));
	logs = [
		jest.spyOn(console, 'error').mockImplementation(() => {}),
		jest.spyOn(console, 'warn').mockImplementation(() => {}),
		jest.spyOn(console, 'log').mockImplementation(() => {}),
	];
});
afterEach(() => {
	try {
		expect(changePasswordTransport).toHaveBeenCalledTimes(expectedPasswordCalls);
		expect(refresh).toHaveBeenCalledTimes(expectedRefreshCalls);
		expect(profile).toHaveBeenCalledTimes(expectedProfileCalls);
		expect(logout).toHaveBeenCalledTimes(expectedLogoutCalls);
		expect(globalThis.fetch).toHaveBeenCalledTimes(expectedProfileFetchCalls);
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
	it.each([
		{ label: 'string', email: { email: 'server@example.invalid' } },
		{ label: 'null', email: { email: null } },
		{ label: 'missing', email: {} },
	])('persists server login email ($label) and ignores client email updates', async ({ email }) => {
		login.mockResolvedValue({
			access_token: token(now + 3600),
			refreshToken: token(now + 7200),
			user: {
				id: 'user-id',
				username: 'sample',
				avatarUrl: null,
				...email,
			},
		});
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		expect(decoded?.backendSession).toMatchObject({ ...email, sessionExpiresAt: now + 7200 });
		expect(Object.prototype.hasOwnProperty.call(decoded?.backendSession, 'email')).toBe(
			'email' in email,
		);
		const publicResponse = await handlers.GET(
			new NextRequest(`${origin}/api/auth/session`, { headers: { cookie } }),
		);
		const publicSession = await publicResponse.json();
		expect(publicSession.user).toEqual({
			id: 'user-id',
			username: 'sample',
			image: null,
			...email,
		});
		expect(JSON.stringify(publicSession)).not.toMatch(
			/accessToken|refreshToken|access_token|refresh_token|backendSession|password|synthetic/,
		);
		const updated = await updateSession(cookie, {
			email: 'client@example.invalid',
			user: { email: 'client@example.invalid' },
			backendSession: { email: 'client@example.invalid', sessionExpiresAt: now + 999999 },
		});
		const output = await updated.json();
		expect(output.user).toEqual(publicSession.user);
		expect(output.expires).toBe(new Date((now + 7200) * 1000).toISOString());
		const nextCookie = cookiesFrom(updated);
		const restored = await restore(nextCookie);
		expect(restored?.user).toEqual(publicSession.user);
		expect((await decodeSession(nextCookie))?.exp).toBe(now + 7200);
		expect(refresh).not.toHaveBeenCalled();
	});
	it.each([
		{
			label: 'replaces from server string',
			returned: { email: 'after@example.invalid' },
			expected: { email: 'after@example.invalid' },
		},
		{ label: 'clears with server null', returned: { email: null }, expected: { email: null } },
		{
			label: 'retains confirmed email when missing',
			returned: {},
			expected: { email: 'before@example.invalid' },
		},
	])('refresh email: $label', async ({ returned, expected }) => {
		login.mockResolvedValue({
			access_token: token(now + 3600),
			refreshToken: token(now + 7200),
			user: {
				id: 'user-id',
				username: 'sample',
				avatarUrl: null,
				email: 'before@example.invalid',
			},
		});
		const cookie = await signIn();
		jest.setSystemTime((now + 3601) * 1000);
		expectedRefreshCalls = 1;
		refresh.mockResolvedValue({
			access_token: token(now + 10000),
			refreshToken: token(now + 20000),
			user: {
				id: 'user-id',
				username: 'sample',
				avatarUrl: null,
				...returned,
			},
		});
		const response = await updateSession(cookie, {
			email: 'client@example.invalid',
			user: { email: 'client@example.invalid' },
			backendSession: { email: 'client@example.invalid', sessionExpiresAt: now + 999999 },
		});
		const output = await response.json();
		expect(output.user).toEqual({ id: 'user-id', username: 'sample', image: null, ...expected });
		expect(output.requiresRefresh).toBe(false);
		expect(JSON.stringify(output)).not.toMatch(
			/accessToken|refreshToken|access_token|refresh_token|backendSession|password|synthetic|client@example/,
		);
		const nextCookie = cookiesFrom(response);
		const decoded = await decodeSession(nextCookie);
		expect(decoded?.backendSession).toMatchObject({ ...expected, sessionExpiresAt: now + 7200 });
		expect(decoded?.exp).toBe(now + 7200);
		expect((await restore(nextCookie))?.user).toEqual(output.user);
	});
	it('accepts a legacy encrypted JWT without email and enriches it only on a necessary refresh', async () => {
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			maxAge: 7200,
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
					sessionExpiresAt: now + 7200,
				},
			},
		});
		const cookie = `${sessionCookieName}=${value}`;
		issuedCookies.push(cookie);
		const session = await restore(cookie);
		expect(session?.user).toEqual({ id: 'user-id', username: 'sample', image: null });
		const unchanged = await updateSession(cookie, { user: { email: 'client@example.invalid' } });
		expect((await unchanged.json()).user).not.toHaveProperty('email');
		expect(refresh).not.toHaveBeenCalled();
		jest.setSystemTime((now + 3601) * 1000);
		expectedRefreshCalls = 1;
		refresh.mockResolvedValue({
			access_token: token(now + 10000),
			refreshToken: token(now + 20000),
			user: { id: 'user-id', username: 'sample', avatarUrl: null, email: 'server@example.invalid' },
		});
		const enriched = await updateSession(cookie);
		expect((await enriched.json()).user.email).toBe('server@example.invalid');
	});
});

describe('real Auth.js signout', () => {
	const signOutRequest = async (cookie: string) => {
		const csrf = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`));
		const { csrfToken } = await csrf.json();
		return handlers.POST(
			new NextRequest(`${origin}/api/auth/signout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					cookie: `${cookie}; ${cookiesFrom(csrf)}`,
				},
				body: new URLSearchParams({ csrfToken, callbackUrl: `${origin}/ru/auth/login` }),
			}),
		);
	};
	const expectCleared = async (response: Response) => {
		expect(response.status).toBe(302);
		const cleared = response.headers
			.getSetCookie()
			.filter((value) => value.startsWith(sessionCookieName));
		expect(cleared.length).toBeGreaterThan(0);
		for (const value of cleared) expect(value).toContain('Max-Age=0');
		expect(await restore(cookiesFrom(response))).toBeNull();
	};
	it.each(['success', '401', '500', 'network', 'timeout'])(
		'clears session after backend %s',
		async (outcome) => {
			const cookie = await signIn();
			const session = JSON.stringify(await restore(cookie));
			expect(session).not.toContain(token(now + 3600));
			expect(session).not.toContain(token(now + 7200));
			expectedLogoutCalls = 1;
			if (outcome === 'timeout') logout.mockImplementation(() => new Promise(() => {}));
			else if (outcome !== 'success')
				logout.mockRejectedValue(
					new BackendAuthError(
						outcome === 'network' ? 'network' : 'http',
						Number(outcome) || undefined,
					),
				);
			const response = signOutRequest(cookie);
			if (outcome === 'timeout') {
				while (logout.mock.calls.length === 0)
					await new Promise<void>((resolve) => setImmediate(resolve));
				await jest.advanceTimersByTimeAsync(3001);
			}
			await expectCleared(await response);
			expect(logout).toHaveBeenCalledWith(token(now + 3600));
		},
	);
	it('clears a JWT without backend credentials without calling NestJS', async () => {
		const jwt = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: { sub: 'user-id', backendSession: { accessToken: 'untrusted' } },
			maxAge: 3600,
		});
		await expectCleared(await signOutRequest(`${sessionCookieName}=${jwt}`));
	});
});

describe('server-only own profile access', () => {
	it.each(['sessionExpiresAt', 'refreshExpiresAt'])(
		'enforces stored %s independently of JWT expiry',
		async (field) => {
			const value = await encode({
				secret: process.env.AUTH_SECRET!,
				salt: sessionCookieName,
				maxAge: 3600,
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
						sessionExpiresAt: now + 7200,
						[field]: now - 1,
					},
				},
			});
			requestHeaders = new Headers({
				host: 'site.example',
				cookie: `${sessionCookieName}=${value}`,
			});
			expect(await getOwnProfile()).toEqual({ status: 'unauthenticated' });
			expect(await mutateOwnAvatar({ operation: 'delete' })).toEqual({ status: 'unauthenticated' });
		},
	);

	it('rejects a damaged encrypted cookie without a backend request', async () => {
		requestHeaders = new Headers({ host: 'site.example', cookie: `${sessionCookieName}=damaged` });
		expect(await getOwnProfile()).toEqual({ status: 'unauthenticated' });
	});

	it('does not fetch for a guest', async () => {
		expect(await getOwnProfile()).toEqual({ status: 'unauthenticated' });
	});

	it('uses a real encrypted Auth.js cookie and returns only a profile projection', async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', cookie });
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'user-id',
					username: 'sample',
					email: 'test@example.invalid',
					isVerified: true,
					avatarUrl: null,
					birthday: null,
					country: null,
					city: null,
					userRoles: [{ id: 1, name: 'candidate', permissions: [] }],
					profiles: [{ id: 'profile-id', isActive: true, specializationId: 11, profileSkills: [] }],
					access_token: 'must-not-return',
				}),
				{ status: 200 },
			),
		);
		const result = await getOwnProfile();
		expect(result).toMatchObject({ status: 'success', profile: { id: 'user-id' } });
		expect(JSON.stringify(result)).not.toMatch(
			/accessToken|refreshToken|access_token|backendSession|must-not-return/,
		);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			new URL('https://backend.example/auth/profile'),
			expect.objectContaining({
				cache: 'no-store',
			}),
		);
		expectRequestHeaders(0, { Authorization: `Bearer ${token(now + 3600)}` });
	});

	it('requires writable refresh after access expiry without rotating on read', async () => {
		const cookie = await signIn();
		jest.setSystemTime((now + 3601) * 1000);
		requestHeaders = new Headers({ host: 'site.example', cookie });
		expect(await getOwnProfile()).toEqual({ status: 'refresh-required' });
	});

	it('rejects the expired absolute deadline', async () => {
		const cookie = await signIn();
		jest.setSystemTime((now + 7201) * 1000);
		requestHeaders = new Headers({ host: 'site.example', cookie });
		expect(await getOwnProfile()).toEqual({ status: 'unauthenticated' });
	});

	it('does not accept a Bearer header instead of the session cookie', async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({
			host: 'site.example',
			authorization: `Bearer ${cookie.split('=')[1]}`,
		});
		expect(await getOwnProfile()).toEqual({ status: 'unauthenticated' });
	});
});

describe('authorized avatar mutation and writable session', () => {
	const avatarUrl = 'https://images.example/new-avatar.png';
	const sizedPng = (size: number) => {
		const checksum = (bytes: Buffer) => {
			let value = 0xffffffff;
			for (const byte of bytes) {
				value ^= byte;
				for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
			}
			return (value ^ 0xffffffff) >>> 0;
		};
		const chunk = (name: string, data: Buffer) => {
			const type = Buffer.from(name);
			const length = Buffer.alloc(4);
			length.writeUInt32BE(data.length);
			const crc = Buffer.alloc(4);
			crc.writeUInt32BE(checksum(Buffer.concat([type, data])));
			return Buffer.concat([length, type, data, crc]);
		};
		const header = Buffer.alloc(13);
		header.writeUInt32BE(128);
		header.writeUInt32BE(128, 4);
		header[8] = 8;
		header[9] = 6;
		const start = Buffer.concat([
			Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
			chunk('IHDR', header),
			chunk('IDAT', deflateSync(Buffer.alloc((128 * 4 + 1) * 128))),
		]);
		const end = chunk('IEND', Buffer.alloc(0));
		const padding =
			size > start.length + end.length + 20
				? chunk(
						'tEXt',
						Buffer.concat([
							Buffer.from('comment\0'),
							Buffer.alloc(size - start.length - end.length - 20, 120),
						]),
					)
				: Buffer.alloc(0);
		return Buffer.concat([start, padding, end]).toString('base64');
	};

	const image = Buffer.from('synthetic-image').toString('base64');
	const prepare = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	const patchReply = (body: unknown, status = 200) => {
		expectedProfileFetchCalls++;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify(body), { status }));
	};

	it.each([0, 1024 * 1024 + 1, 5 * 1024 * 1024])(
		'accepts canonical avatar base64 size %s with the real mutator',
		async (size) => {
			await prepare();
			const avatarImage = sizedPng(size);
			patchReply({ id: 'user-id', avatarUrl });
			await expect(mutateOwnAvatar({ operation: 'set', avatarImage })).resolves.toEqual({
				status: 'success',
				avatarUrl,
			});
			const requestBody = jest.mocked(globalThis.fetch).mock.calls[0][1]?.body;
			if (typeof requestBody !== 'string') throw new Error('Expected a JSON request body');
			const body = JSON.parse(requestBody) as {
				avatarImage: string;
			};
			expect(Object.keys(body)).toEqual(['avatarImage']);
			expect(body.avatarImage === avatarImage).toBe(true);
			expect(body.avatarImage.startsWith('data:')).toBe(false);
		},
	);

	it.each([
		'aG@=',
		'AAAA=AAA',
		'=AAA',
		'A===',
		'AAA==',
		'AAA',
		'AA',
		'AAAA====',
		'AB==',
		'AAB=',
		'éAAA',
		'AA==\n',
	])('rejects noncanonical base64 case %# without a request', async (avatarImage) => {
		await prepare();
		await expect(mutateOwnAvatar({ operation: 'set', avatarImage })).resolves.toEqual({
			status: 'validation-error',
		});
	});

	it('rejects decoded bytes above 5 MiB even when the encoded length fits the bound', async () => {
		await prepare();
		const avatarImage = sizedPng(5 * 1024 * 1024 + 1);
		await expect(mutateOwnAvatar({ operation: 'set', avatarImage })).resolves.toEqual({
			status: 'validation-error',
		});
	});

	it.each(['success', 'error'] as const)(
		'passes through the real Action and real mutator: %s',
		async (status) => {
			const { changeOwnAvatar } = await import('./app/[locale]/(public)/profile/actions');
			expect(jest.isMockFunction(mutateOwnAvatar)).toBe(false);
			await prepare();
			const avatarImage = sizedPng(status === 'success' ? 5 * 1024 * 1024 : 0);
			patchReply({ id: 'user-id', avatarUrl }, status === 'error' ? 500 : 200);
			const result = await changeOwnAvatar({ operation: 'set', avatarImage });
			expect(result).toEqual(status === 'success' ? { status, avatarUrl } : { status });
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			const requestBody = jest.mocked(globalThis.fetch).mock.calls[0][1]?.body;
			if (typeof requestBody !== 'string') throw new Error('Expected a JSON request body');
			const body = JSON.parse(requestBody) as {
				avatarImage: string;
			};
			expect(body.avatarImage === avatarImage).toBe(true);
			expect(body.avatarImage.startsWith('data:')).toBe(false);
		},
	);

	it.each(['set', 'delete'] as const)(
		'returns confirmed %s without reading or writing Auth.js session',
		async (operation) => {
			const original = await prepare();
			const previous = await decodeSession(original);
			const nextImage = operation === 'set' ? avatarUrl : '';
			patchReply({ id: 'user-id', avatarUrl: nextImage, email: 'ignored@example.invalid' });
			const result = await mutateOwnAvatar(
				operation === 'set' ? { operation, avatarImage: image } : { operation },
			);
			expect(result).toEqual({ status: 'success', avatarUrl: nextImage || null });
			expect(globalThis.fetch).toHaveBeenCalledWith(
				new URL('https://backend.example/users/user-id'),
				expect.objectContaining({
					method: 'PATCH',
					cache: 'no-store',
					redirect: 'manual',
					credentials: 'omit',
					headers: new Headers({
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token(now + 3600)}`,
					}),
					body: JSON.stringify(operation === 'set' ? { avatarImage: image } : { avatarUrl: '' }),
				}),
			);
			expect(profile).not.toHaveBeenCalled();
			expect(cookieWrites).toHaveLength(0);
			const decoded = await decodeSession(original);
			expect(decoded?.backendSession).toEqual(previous?.backendSession);
			expect((await restore(original))?.user?.image).toBe('https://images.example/avatar');

			expect(JSON.stringify(result)).not.toMatch(
				/accessToken|refreshToken|backendSession|synthetic|ignored/,
			);
			expect(JSON.stringify(result)).not.toContain(image);
		},
	);

	it('does not trust client avatar fields, even with the synchronization signal', async () => {
		const cookie = await prepare();
		const response = await updateSession(cookie, {
			syncAvatar: true,
			image: 'https://attacker.invalid',
			user: { id: 'other', image: 'https://attacker.invalid' },
		});
		const decoded = await decodeSession(cookiesFrom(response));
		expect(decoded?.backendSession).toMatchObject({
			userId: 'user-id',
			avatarUrl: 'https://images.example/avatar',
			sessionExpiresAt: now + 7200,
		});
		expect(JSON.stringify(await response.json())).not.toContain('attacker');
	});

	it('refuses a guest and rejects a supplied target user ID', async () => {
		expect(await mutateOwnAvatar({ operation: 'delete' })).toEqual({ status: 'unauthenticated' });
		await prepare();
		const input = { operation: 'delete' as const, userId: 'other-user' };
		expect(await mutateOwnAvatar(input)).toEqual({ status: 'validation-error' });
	});

	it.each([
		null,
		{},
		{ operation: 'set', avatarImage: 'data:image/png;base64,abc' },
		{ operation: 'set', avatarImage: '' },
		{ operation: 'unknown' },
	])('rejects invalid input %# before the backend', async (input) => {
		expect(await mutateOwnAvatar(input as Parameters<typeof mutateOwnAvatar>[0])).toEqual({
			status: 'validation-error',
		});
	});

	it.each([401, 403, 500, 302])('keeps session unchanged on HTTP %s', async (status) => {
		const cookie = await prepare();
		patchReply({ internal: 'hidden' }, status);
		expect(await mutateOwnAvatar({ operation: 'delete' })).toEqual({
			status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
		});
		expect(cookieWrites).toHaveLength(0);
		expect((await restore(cookie))?.user?.image).toBe('https://images.example/avatar');
	});

	it.each([{ id: 'other', avatarUrl }, { id: 'user-id', avatarUrl: 123 }, null])(
		'rejects identity mismatch or invalid backend data %#',
		async (body) => {
			await prepare();
			patchReply(body);
			expect(await mutateOwnAvatar({ operation: 'set', avatarImage: image })).toEqual({
				status: body?.id === 'other' ? 'identity-mismatch' : 'error',
			});
			expect(cookieWrites).toHaveLength(0);
		},
	);

	it('handles network failure and permits an explicit later retry', async () => {
		await prepare();
		expectedProfileFetchCalls++;
		expect(await mutateOwnAvatar({ operation: 'set', avatarImage: image })).toEqual({
			status: 'error',
		});
		expect(cookieWrites).toHaveLength(0);
		patchReply({ id: 'user-id', avatarUrl });
		expect(await mutateOwnAvatar({ operation: 'set', avatarImage: image })).toEqual({
			status: 'success',
			avatarUrl,
		});
	});

	it('aborts a hung PATCH without writing a session', async () => {
		await prepare();
		expectedProfileFetchCalls++;
		jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));
		const pending = mutateOwnAvatar({ operation: 'delete' });
		while (jest.mocked(globalThis.fetch).mock.calls.length === 0) {
			await new Promise<void>((resolve) => setImmediate(resolve));
		}
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'error' });
		expect(cookieWrites).toHaveLength(0);
	});

	it.each([3601, 7201])('rejects expired credentials at +%s seconds', async (seconds) => {
		await prepare();
		jest.setSystemTime((now + seconds) * 1000);
		expect(await mutateOwnAvatar({ operation: 'delete' })).toEqual({
			status: seconds < 7200 ? 'refresh-required' : 'unauthenticated',
		});
	});

	it('bounds avatar response decoding without retry or session writes', async () => {
		await prepare();
		expectedProfileFetchCalls++;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValue({ status: 200, json: () => new Promise(() => {}) } as unknown as Response);
		const pending = mutateOwnAvatar({ operation: 'delete' });
		while (jest.mocked(globalThis.fetch).mock.calls.length === 0)
			await new Promise<void>((resolve) => setImmediate(resolve));
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'error' });
		expect(jest.mocked(globalThis.fetch).mock.calls).toHaveLength(1);
		expect(jest.mocked(globalThis.fetch).mock.calls[0][1]?.signal?.aborted).toBe(true);
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not follow avatar redirects or write a session', async () => {
		await prepare();
		patchReply({}, 302);
		expect(await mutateOwnAvatar({ operation: 'delete' })).toEqual({ status: 'error' });
		expect(jest.mocked(globalThis.fetch).mock.calls).toHaveLength(1);
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not require writable cookies to confirm a backend mutation', async () => {
		await prepare();
		patchReply({ id: 'user-id', avatarUrl });
		writableCookies = false;
		expect(await mutateOwnAvatar({ operation: 'set', avatarImage: image })).toEqual({
			status: 'success',
			avatarUrl,
		});
		expect(cookieWrites).toHaveLength(0);
	});
});

describe('authorized profile editing and persisted username', () => {
	const input = { username: 'New name', city: '', socialNetwork: [], profileSkills: [1] };
	const ownProfile = (username = 'sample') => ({
		id: 'user-id',
		username,
		email: 'test@example.invalid',
		isVerified: true,
		avatarUrl: 'https://images.example/backend-different-avatar',
		birthday: null,
		country: null,
		city: '',
		userRoles: [],
		profiles: [
			{
				id: 'profile-id',
				isActive: true,
				specializationId: 1,
				description: 'Old',
				socialNetwork: [],
				profileSkills: [{ id: 1, title: 'JS' }],
			},
		],
	});
	const prepare = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	const replies = () => {
		expectedProfileFetchCalls = 4;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(ownProfile())))
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ id: 'profile-id', socialNetwork: [], profileSkills: [{ id: 1 }] }),
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ id: 'user-id', username: input.username, city: '' })),
			)
			.mockResolvedValueOnce(new Response(JSON.stringify(ownProfile(input.username))));
	};
	const savedCookie = () => {
		const cookie = cookieWrites
			.filter(({ value }) => value)
			.map(({ name, value }) => `${name}=${value}`)
			.join('; ');
		issuedCookies.push(cookie);
		return cookie;
	};

	it.each([true, false])(
		'initial specialization uses trusted credentials and readback (confirmed=%s)',
		async (confirmed) => {
			await prepare();
			const original = ownProfile();
			original.profiles[0].specializationId = 0;
			const saved = ownProfile(input.username);
			saved.profiles[0].specializationId = confirmed ? 11 : 0;
			expectedProfileFetchCalls = confirmed ? 5 : 4;
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValueOnce(new Response(JSON.stringify(original)))
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify({ id: 'profile-id', socialNetwork: [], profileSkills: [{ id: 1 }] }),
					),
				)
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ id: 'user-id', username: input.username, city: '' })),
				)
				.mockResolvedValueOnce(new Response(JSON.stringify(saved)))
				.mockResolvedValueOnce(new Response(JSON.stringify(saved)));
			const result = await mutateOwnProfile({
				...input,
				expectedProfileId: 'profile-id',
				specializationId: 11,
			});
			expect(result).toEqual(
				confirmed
					? { status: 'success' }
					: {
							status: 'partial-success',
							profile: 'unconfirmed',
							user: 'unconfirmed',
							reason: 'error',
						},
			);
			expect(
				jest.mocked(globalThis.fetch).mock.calls.filter(([, options]) => options?.method === 'PUT'),
			).toHaveLength(1);
			if (!confirmed) expect(cookieWrites).toHaveLength(0);
		},
	);
	it('rejects a stale draft through the real auth boundary without mutation', async () => {
		await prepare();
		expectedProfileFetchCalls = 1;
		const original = ownProfile();
		original.profiles[0].specializationId = 0;
		jest.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(JSON.stringify(original)));
		expect(
			await mutateOwnProfile({
				...input,
				expectedProfileId: 'previous-profile',
				specializationId: 11,
			}),
		).toEqual({ status: 'forbidden' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('mutates through real server code and writes an Auth.js cookie containing only the confirmed new username', async () => {
		const cookie = await prepare();
		const before = (await decodeSession(cookie))!.backendSession;
		replies();
		expect(await mutateOwnProfile(input)).toEqual({ status: 'success' });
		expect(cookieWrites.length).toBeGreaterThan(0);
		const persisted = savedCookie();
		expect((await decodeSession(persisted))!.backendSession).toEqual({
			...(before as object),
			username: input.username,
		});
		expect(await restore(persisted)).toMatchObject({
			user: { id: 'user-id', username: input.username, image: 'https://images.example/avatar' },
		});
		expect(JSON.stringify(await restore(persisted))).not.toMatch(
			/accessToken|refreshToken|backendSession|access_token/,
		);
		expect(
			jest.mocked(globalThis.fetch).mock.calls.filter(([, options]) => options?.method === 'PATCH'),
		).toHaveLength(1);
	});
	it.each(['guest', 'access', 'refresh', 'absolute', 'identity'])(
		'refuses %s without any backend mutation',
		async (outcome) => {
			if (outcome !== 'guest') {
				const cookie = await prepare();
				if (outcome === 'identity' || outcome === 'absolute' || outcome === 'refresh') {
					const decoded = (await decodeSession(cookie))!;
					const backendSession = decoded.backendSession as Record<string, unknown>;
					const jwt = await encode({
						secret: process.env.AUTH_SECRET!,
						salt: sessionCookieName,
						maxAge: 10000,
						token: {
							...decoded,
							...(outcome === 'identity' ? { sub: 'other' } : {}),
							backendSession: {
								...backendSession,
								...(outcome === 'absolute'
									? { sessionExpiresAt: now - 1 }
									: outcome === 'refresh'
										? { refreshExpiresAt: now - 1 }
										: {}),
							},
						},
					});
					requestHeaders.set('cookie', `${sessionCookieName}=${jwt}`);
				} else jest.setSystemTime((now + 3601) * 1000);
			}
			expect(await mutateOwnProfile(input)).toEqual({ status: 'unauthorized' });
			expect(cookieWrites).toHaveLength(0);
		},
	);
	it.each(['userId', 'profileId'])(
		'rejects client identity field %s before reading the backend',
		async (field) => {
			await prepare();
			expect(await mutateOwnProfile({ ...input, [field]: 'other' })).toEqual({
				status: 'validation-error',
			});
		},
	);
	it('returns sync-required in a read-only cookie context without repeating PUT or PATCH', async () => {
		await prepare();
		replies();
		writableCookies = false;
		expect(await mutateOwnProfile(input)).toEqual({ status: 'sync-required' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('returns sync-required when the backend re-read cannot confirm the new username', async () => {
		await prepare();
		replies();
		jest
			.mocked(globalThis.fetch)
			.mockReset()
			.mockResolvedValueOnce(new Response(JSON.stringify(ownProfile())))
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ id: 'profile-id', socialNetwork: [], profileSkills: [{ id: 1 }] }),
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ id: 'user-id', username: input.username, city: '' })),
			)
			.mockRejectedValueOnce(new Error('Private network failure'));
		expect(await mutateOwnProfile(input)).toEqual({ status: 'sync-required' });
		expect((await decodeSession(savedCookie()))!.backendSession).toMatchObject({
			username: 'sample',
		});
	});
	it('keeps the original cookie and does not synchronize after a failed PATCH', async () => {
		await prepare();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(ownProfile())))
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ id: 'profile-id', socialNetwork: [], profileSkills: [{ id: 1 }] }),
				),
			)
			.mockResolvedValueOnce(new Response('{}', { status: 500 }));
		expect(await mutateOwnProfile(input)).toEqual({
			status: 'partial-success',
			profile: 'confirmed',
			user: 'unconfirmed',
			reason: 'error',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('ignores client username/name/email/image even when requesting verified profile synchronization', async () => {
		const cookie = await prepare();
		const before = (await decodeSession(cookie))!.backendSession;
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(ownProfile('Verified name'))));
		const response = await updateSession(cookie, {
			syncProfile: true,
			name: 'attacker',
			username: 'attacker',
			user: { id: 'other', username: 'attacker', email: 'attacker', image: 'attacker' },
		});
		const persisted = cookiesFrom(response);
		expect((await decodeSession(persisted))!.backendSession).toEqual({
			...(before as object),
			username: 'Verified name',
		});
	});
	it('runs the real Server Action, mutator, backend transport and writable Auth.js update', async () => {
		await prepare();
		replies();
		const { saveProfile } = await import('./app/[locale]/(public)/profile/edit/actions');
		expect(await saveProfile(input)).toEqual({ status: 'success' });
		expect((await decodeSession(savedCookie()))!.backendSession).toMatchObject({
			username: input.username,
		});
	});
	it('validates oversized UTF-8 before any backend call through the real mutator', async () => {
		await prepare();
		expect(await mutateOwnProfile({ ...input, description: 'я'.repeat(32_768) + 'a' })).toEqual({
			status: 'validation-error',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('refuses another identity during username synchronization', async () => {
		const cookie = await prepare();
		const before = (await decodeSession(cookie))!.backendSession;
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ ...ownProfile('Attacker'), id: 'other' })),
			);
		const result = await updateSession(cookie, { syncProfile: true });
		expect((await decodeSession(cookiesFrom(result)))!.backendSession).toEqual(before);
	});
});

describe('avatar mutation is independent of session synchronization', () => {
	it.each([null, '', 'https://images.example/confirmed.png'])(
		'returns the checked backend avatar %# with no readback or cookie writes',
		async (avatarUrl) => {
			const original = await signIn();
			requestHeaders = new Headers({
				host: 'site.example',
				'x-forwarded-proto': 'https',
				cookie: original,
			});
			writableCookies = false;
			expectedProfileFetchCalls = 1;
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValue(
					new Response(JSON.stringify({ id: 'user-id', avatarUrl }), { status: 200 }),
				);
			const result = await mutateOwnAvatar(
				avatarUrl
					? { operation: 'set', avatarImage: Buffer.from('synthetic').toString('base64') }
					: { operation: 'delete' },
			);
			expect(result).toEqual({ status: 'success', avatarUrl: avatarUrl || null });
			expect(profile).not.toHaveBeenCalled();
			expect(cookieWrites).toHaveLength(0);
			expect((await restore(original))?.user?.image).toBe('https://images.example/avatar');
		},
	);
});

describe('read-only Header projection using existing session credentials', () => {
	const fresh = {
		id: 'user-id',
		username: 'Backend name',
		email: null,
		avatarUrl: 'https://images.example/fresh',
	};
	it('reads current identity, does not require profiles, and leaves encrypted session and cookies unchanged', async () => {
		const cookie = await signIn();
		const original = await decodeSession(cookie);
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		writableCookies = false;
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(
			new Response(JSON.stringify({ ...fresh, access_token: 'synthetic-hidden' }), {
				status: 200,
			}),
		);
		expect(getHeaderProfile.length).toBe(0);
		expect(await getHeaderProfile()).toEqual({
			status: 'success',
			profile: {
				userId: 'user-id',
				username: 'Backend name',
				email: null,
				avatarUrl: fresh.avatarUrl,
			},
		});
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
		expect((await restore(cookie))?.user?.image).toBe('https://images.example/avatar');
	});
	it('does not request a profile for guests', async () => {
		expect(await getHeaderProfile()).toEqual({ status: 'unauthenticated' });
	});
	it.each([3601, 7201])('does not use expired credentials at +%s', async (seconds) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		jest.setSystemTime((now + seconds) * 1000);
		expect(await getHeaderProfile()).toEqual({
			status: seconds < 7200 ? 'refresh-required' : 'unauthenticated',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects an expired absolute deadline with otherwise live credentials', async () => {
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
			throw new Error('Synthetic session missing');
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		expect(await getHeaderProfile()).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([401, 403])('preserves HTTP %s without changing session', async (status) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response('{}', { status }));
		expect(await getHeaderProfile()).toEqual({
			status: status === 401 ? 'unauthenticated' : 'forbidden',
		});
		expect(cookieWrites).toHaveLength(0);
	});
});

describe('read-only settings snapshot using existing session credentials', () => {
	const fresh = {
		id: 'user-id',
		username: 'Backend name',
		email: null,
		isVerified: false,
		telegramUsername: null,
		profiles: [],
		subscriptions: [],
	};
	it('reads current identity, does not require profiles, and leaves encrypted session and cookies unchanged', async () => {
		const cookie = await signIn();
		const original = await decodeSession(cookie);
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		writableCookies = false;
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(
			new Response(JSON.stringify({ ...fresh, access_token: 'synthetic-hidden' }), {
				status: 200,
			}),
		);
		expect(getSettingsSnapshot.length).toBe(0);
		expect(await getSettingsSnapshot()).toEqual({
			status: 'success',
			snapshot: {
				userId: 'user-id',
				username: 'Backend name',
				hasPremiumAccess: false,
				canStartTrial: false,
				email: null,
				isVerified: false,
				telegramUsername: null,
				profiles: [],
				subscriptions: [],
				activeProfileId: null,
			},
		});
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
		expect((await restore(cookie))?.user?.image).toBe('https://images.example/avatar');
	});
	it('does not request a profile for guests', async () => {
		expect(await getSettingsSnapshot()).toEqual({ status: 'unauthenticated' });
	});
	it.each([3601, 7201])('does not use expired credentials at +%s', async (seconds) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		jest.setSystemTime((now + seconds) * 1000);
		expect(await getSettingsSnapshot()).toEqual({
			status: seconds < 7200 ? 'refresh-required' : 'unauthenticated',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects an expired absolute deadline with otherwise live credentials', async () => {
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
			throw new Error('Synthetic session missing');
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		expect(await getSettingsSnapshot()).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([401, 403])('preserves HTTP %s without changing session', async (status) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response('{}', { status }));
		expect(await getSettingsSnapshot()).toEqual({
			status: status === 401 ? 'unauthenticated' : 'forbidden',
		});
		expect(cookieWrites).toHaveLength(0);
	});
});

it.each(['invalid-cookie', 'wrong-identity'])(
	'rejects settings session %s before loader',
	async (kind) => {
		let cookie = `${sessionCookieName}=invalid`;
		if (kind === 'wrong-identity') {
			const original = await signIn();
			const decoded = await decodeSession(original);
			const value = await encode({
				secret: process.env.AUTH_SECRET!,
				salt: sessionCookieName,
				token: { ...decoded, sub: 'other' },
			});
			cookie = `${sessionCookieName}=${value}`;
		}
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expect(await getSettingsSnapshot()).toEqual({ status: 'unauthenticated' });
		expect(globalThis.fetch).not.toHaveBeenCalled();
	},
);

describe('verification email authorization through existing session credentials', () => {
	it('reads current identity, does not require profiles, and leaves encrypted session and cookies unchanged', async () => {
		const cookie = await signIn();
		const original = await decodeSession(cookie);
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		writableCookies = false;
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValue(
				new Response(JSON.stringify({ message: 'Verification email was sent' }), { status: 200 }),
			);
		expect(sendOwnVerificationEmail.length).toBe(0);
		expect(await sendOwnVerificationEmail()).toEqual({ status: 'success' });
		expect(globalThis.fetch).toHaveBeenCalledWith(
			new URL('https://backend.example/auth/send-verification-email/user-id'),
			expect.objectContaining({
				method: 'GET',
				cache: 'no-store',
			}),
		);
		expectRequestHeaders(0, { Authorization: `Bearer ${token(now + 3600)}` });
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
		expect((await restore(cookie))?.user?.image).toBe('https://images.example/avatar');
	});
	it('does not request a profile for guests', async () => {
		expect(await sendOwnVerificationEmail()).toEqual({ status: 'unauthenticated' });
	});
	it.each([3601, 7201])('does not use expired credentials at +%s', async (seconds) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		jest.setSystemTime((now + seconds) * 1000);
		expect(await sendOwnVerificationEmail()).toEqual({
			status: seconds < 7200 ? 'refresh-required' : 'unauthenticated',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects an expired absolute deadline with otherwise live credentials', async () => {
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
			throw new Error('Synthetic session missing');
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		expect(await sendOwnVerificationEmail()).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([401, 403])('preserves HTTP %s without changing session', async (status) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response('{}', { status }));
		expect(await sendOwnVerificationEmail()).toEqual({
			status: status === 401 ? 'unauthenticated' : 'forbidden',
		});
		expect(cookieWrites).toHaveLength(0);
	});
});

it('does not send email for an invalid cookie or mismatched session identity', async () => {
	requestHeaders = new Headers({
		host: 'site.example',
		'x-forwarded-proto': 'https',
		cookie: `${sessionCookieName}=invalid`,
	});
	expect(await sendOwnVerificationEmail()).toEqual({ status: 'unauthenticated' });
	const cookie = await signIn();
	const decoded = await decodeSession(cookie);
	const value = await encode({
		secret: process.env.AUTH_SECRET!,
		salt: sessionCookieName,
		token: { ...decoded, sub: 'other' },
	});
	requestHeaders = new Headers({
		host: 'site.example',
		'x-forwarded-proto': 'https',
		cookie: `${sessionCookieName}=${value}`,
	});
	expect(await sendOwnVerificationEmail()).toEqual({ status: 'unauthenticated' });
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

describe('Telegram operations use existing private credentials without session updates', () => {
	const telegramPayload = {
		id: 123,
		first_name: ' Test ',
		auth_date: 1800000000,
		hash: 'a'.repeat(64),
		username: 'telegram_user',
	};
	const invoke = (operation: string) =>
		operation === 'link' ? linkOwnTelegram(telegramPayload) : unlinkOwnTelegram();
	const selectCookie = (cookie: string) => {
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
	};
	it.each(['link', 'unlink'])(
		'authorizes %s with only server credentials and leaves cookies unchanged',
		async (operation) => {
			const cookie = await signIn();
			const original = await decodeSession(cookie);
			selectCookie(cookie);
			writableCookies = false;
			expectedProfileFetchCalls = 1;
			const telegramUsername = operation === 'link' ? 'telegram_user' : null;
			const responseBody = {
				id: 'user-id',
				telegramUsername,
				telegramId: 123,
				refreshToken: 'hidden',
			};
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 201 }));
			expect(await invoke(operation)).toEqual({ status: 'success', telegramUsername });
			expect(globalThis.fetch).toHaveBeenCalledWith(
				new URL(`https://backend.example/users/${operation}-telegram`),
				expect.objectContaining({
					method: 'POST',
					cache: 'no-store',
				}),
			);
			expectRequestHeaders(0, {
				Authorization: `Bearer ${token(now + 3600)}`,
				...(operation === 'link' ? { 'Content-Type': 'application/json' } : {}),
			});
			expect(
				JSON.parse((jest.mocked(globalThis.fetch).mock.calls[0][1]?.body as string) || 'null'),
			).toEqual(operation === 'link' ? telegramPayload : null);
			expect(cookieWrites).toHaveLength(0);
			expect(await decodeSession(cookie)).toEqual(original);
		},
	);
	it.each(['link', 'unlink'])('rejects guest %s before backend', async (operation) => {
		expect(await invoke(operation)).toEqual({ status: 'unauthenticated' });
	});
	it.each(['link', 'unlink'])(
		'rejects expired access and expired session for %s before backend',
		async (operation) => {
			const cookie = await signIn();
			selectCookie(cookie);
			jest.setSystemTime((now + 3601) * 1000);
			expect(await invoke(operation)).toEqual({ status: 'refresh-required' });
			jest.setSystemTime((now + 7201) * 1000);
			expect(await invoke(operation)).toEqual({ status: 'unauthenticated' });
		},
	);
	it.each(['link', 'unlink'])(
		'rejects invalid cookie, identity and absolute deadline for %s',
		async (operation) => {
			selectCookie(`${sessionCookieName}=invalid`);
			expect(await invoke(operation)).toEqual({ status: 'unauthenticated' });
			const cookie = await signIn();
			const decoded = await decodeSession(cookie);
			if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
				throw new Error('Synthetic session missing');
			for (const tokenValue of [
				{ ...decoded, sub: 'other' },
				{ ...decoded, backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 } },
			]) {
				const value = await encode({
					secret: process.env.AUTH_SECRET!,
					salt: sessionCookieName,
					token: tokenValue,
				});
				selectCookie(`${sessionCookieName}=${value}`);
				expect(await invoke(operation)).toEqual({ status: 'unauthenticated' });
			}
		},
	);
	it('rejects forged Yeahub identity in link payload without contacting backend', async () => {
		selectCookie(await signIn());
		expect(await linkOwnTelegram({ ...telegramPayload, userId: 'other' })).toEqual({
			status: 'validation-error',
		});
	});
	it('preserves Telegram failure instead of reporting logout', async () => {
		selectCookie(await signIn());
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValue(
				new Response(JSON.stringify({ message: 'auth.telegram.data_outdated' }), { status: 401 }),
			);
		expect(await linkOwnTelegram(telegramPayload)).toEqual({ status: 'outdated-telegram-data' });
		expect(cookieWrites).toHaveLength(0);
	});
});

describe('password change using real Auth.js writer and private ALS credentials', () => {
	const input = { password: ' NewPassword123! ', passwordConfirm: ' NewPassword123! ' };
	const credential = (exp: number, id = 'user-id', version = 'new') =>
		`synthetic.${Buffer.from(JSON.stringify({ sub: id, exp, version })).toString('base64url')}.signature`;
	const result = (version = 'new') => ({
		access_token: credential(now + 4000, 'user-id', version),
		refreshToken: credential(now + 12000, 'user-id', version),
		user: { id: 'user-id', username: 'must-not-replace', avatarUrl: null },
	});
	const setupPassword = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expectedPasswordCalls = 1;
		changePasswordTransport.mockResolvedValue(result());
		return cookie;
	};
	const written = () => {
		const values = new Map<string, string>();
		for (const { name, value } of cookieWrites) {
			if (value) values.set(name, value);
			else values.delete(name);
		}
		return [...values].map(([name, value]) => `${name}=${value}`).join('; ');
	};
	it('encodes, writes and decodes the replacement pair without changing display fields or deadline', async () => {
		const originalCookie = await setupPassword();
		const original = await decodeSession(originalCookie);
		expect(await changeOwnPassword(input)).toEqual({ status: 'success' });
		expect(changePasswordTransport).toHaveBeenCalledWith({
			userId: 'user-id',
			accessToken: token(now + 3600),
			...input,
		});
		const updated = await decodeSession(written());
		expect(updated?.backendSession).toEqual({
			...(original?.backendSession as object),
			accessToken: result().access_token,
			refreshToken: result().refreshToken,
			accessExpiresAt: now + 4000,
			refreshExpiresAt: now + 12000,
		});
		expect(updated?.exp).toBe(now + 7200);
		const session = await restore(written());
		expect(session?.user?.id).toBe('user-id');
		expect(JSON.stringify(session)).not.toContain(result().access_token);
		expect(JSON.stringify(session)).not.toContain(result().refreshToken);
		expect(cookieWrites.length).toBeGreaterThan(0);
	});
	it('runs the real backend token/cookie parser through the real Auth.js writer', async () => {
		await setupPassword();
		expectedPasswordCalls = 0;
		expectedProfileFetchCalls = 1;
		const actual: typeof import('@/entities/auth/api/backendAuth.server') = jest.requireActual(
			'@/entities/auth/api/backendAuth.server',
		);
		jest
			.mocked(createBackendAuthTransport)
			.mockImplementationOnce((config) => actual.createBackendAuthTransport(config));
		const next = result();
		const headers = new Headers({ 'Content-Type': 'application/json' });
		headers.append('Set-Cookie', `refresh_token=${next.refreshToken}; HttpOnly; Secure`);
		const body = {
			access_token: next.access_token,
			user: { id: 'user-id', username: 'sample', avatarUrl: null },
		};
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValue(new Response(JSON.stringify(body), { status: 200, headers }));
		expect(await changeOwnPassword(input)).toEqual({ status: 'success' });
		const decoded = await decodeSession(written());
		expect((decoded?.backendSession as { refreshToken: string }).refreshToken).toBe(
			next.refreshToken,
		);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'https://backend.example/auth/password-change/user-id',
			expect.objectContaining({ method: 'PATCH', cache: 'no-store', body: JSON.stringify(input) }),
		);
	});

	it.each([
		null,
		{},
		{ ...input, userId: 'other' },
		{ password: 'short', passwordConfirm: 'short' },
		{ ...input, passwordConfirm: 'different' },
		{ ...input, password: 'a'.repeat(256) },
		{ password: null, passwordConfirm: null },
	])('rejects invalid input %# before backend', async (value) => {
		expect(await changeOwnPassword(value)).toEqual({ status: 'validation-error' });
	});
	it('rejects guests without mutation', async () => {
		expect(await changeOwnPassword(input)).toEqual({ status: 'unauthenticated' });
	});
	it('rejects expired access and session deadline without mutation', async () => {
		await setupPassword();
		expectedPasswordCalls = 0;
		jest.setSystemTime((now + 3601) * 1000);
		expect(await changeOwnPassword(input)).toEqual({ status: 'refresh-required' });
		jest.setSystemTime((now + 7201) * 1000);
		expect(await changeOwnPassword(input)).toEqual({ status: 'unauthenticated' });
	});
	it.each([400, 401, 403, 404, 500])('maps backend HTTP %s without retry', async (status) => {
		await setupPassword();
		changePasswordTransport.mockRejectedValue(new BackendAuthError('http', status));
		expect(await changeOwnPassword(input)).toEqual({
			status:
				status === 400
					? 'validation-error'
					: status === 401
						? 'unauthenticated'
						: status === 403
							? 'forbidden'
							: status === 404
								? 'not-found'
								: 'outcome-unknown',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('reports a missing refresh cookie/parser failure as incomplete', async () => {
		await setupPassword();
		changePasswordTransport.mockRejectedValue(new BackendAuthError('protocol', 200));
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'backend-result-unverified',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([
		{ ...result(), access_token: 'malformed' },
		{ ...result(), refreshToken: 'malformed' },
		{ ...result(), user: { ...result().user, id: 'other' } },
		{ ...result(), access_token: credential(now + 4000, 'other') },
		{ ...result(), refreshToken: credential(now + 12000, 'other') },
		{ ...result(), access_token: credential(now - 1) },
	])('rejects unverified replacement %#', async (value) => {
		await setupPassword();
		changePasswordTransport.mockResolvedValue(value);
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'backend-result-unverified',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not install credentials after the original deadline expires during PATCH', async () => {
		await setupPassword();

		// New credentials must still be live so the original deadline is the rejecting condition.
		changePasswordTransport.mockImplementation(() => {
			jest.setSystemTime((now + 7201) * 1000);
			return Promise.resolve({ ...result(), access_token: credential(now + 10000) });
		});
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'deadline-expired',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('reports cookie write failure without success', async () => {
		await setupPassword();
		writableCookies = false;
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'session-update-failed',
		});
	});
	it('handles an unstable_update writer exception without success', async () => {
		await setupPassword();
		jest.mocked(nextCookies).mockRejectedValueOnce(new Error('Synthetic writer failure'));
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'session-update-failed',
		});
	});
	it('detects encoding failure even if Auth.js returned a public session body', async () => {
		await setupPassword();
		failEncoding = true;
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'session-update-failed',
		});
		failEncoding = false;
		expect(await decodeSession(written())).toBeNull();
	});
	it('detects a writer that did not persist the replacement', async () => {
		await setupPassword();
		dropCookieWrites = true;
		expect(await changeOwnPassword(input)).toEqual({
			status: 'incomplete',
			stage: 'session-update-failed',
		});
	});
	it('returns unknown on timeout and does not repeat PATCH', async () => {
		await setupPassword();
		let ready!: () => void;
		const started = new Promise<void>((resolve) => {
			ready = resolve;
		});
		changePasswordTransport.mockImplementation(() => {
			ready();
			return new Promise(() => {});
		});
		const pending = changeOwnPassword(input);
		await started;
		expect(changePasswordTransport).toHaveBeenCalledTimes(1);
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'outcome-unknown' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not trust replacement credentials or ALS markers in a client session update', async () => {
		const cookie = await signIn();
		const response = await updateSession(cookie, {
			passwordReplacement: { next: result() },
			backendSession: result(),
			accessToken: 'forged',
		});
		const decoded = await decodeSession(cookiesFrom(response));
		expect((decoded?.backendSession as { accessToken: string }).accessToken).toBe(
			token(now + 3600),
		);
	});
	it('isolates parallel password replacements and exposes response-order limitation', async () => {
		const cookie = await signIn();
		expectedPasswordCalls = 2;
		const contexts = [1, 2].map(() => ({
			headers: new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie }),
			writes: [] as { name: string; value: string }[],
		}));
		const resolvers: ((value: ReturnType<typeof result>) => void)[] = [];
		let ready!: () => void;
		const started = new Promise<void>((resolve) => {
			ready = resolve;
		});
		changePasswordTransport.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolvers.push(resolve);
					if (resolvers.length === 2) ready();
				}),
		);
		const requests = contexts.map((context) =>
			passwordTestContext.run(context, () => changeOwnPassword(input)),
		);
		await started;
		expect(resolvers).toHaveLength(2);
		resolvers[1](result('second'));
		resolvers[0](result('first'));
		expect(await Promise.all(requests)).toEqual([{ status: 'success' }, { status: 'success' }]);
		for (const [index, context] of contexts.entries()) {
			const latest = new Map(context.writes.map(({ name, value }) => [name, value]));
			const decoded = await decodeSession(
				[...latest].map(([name, value]) => `${name}=${value}`).join('; '),
			);
			expect((decoded?.backendSession as { refreshToken: string }).refreshToken).toBe(
				result(index === 0 ? 'first' : 'second').refreshToken,
			);
		}
	});
	it('does not leak ALS replacement into a concurrent ordinary refresh', async () => {
		const cookie = await signIn();
		expectedPasswordCalls = 1;
		expectedRefreshCalls = 1;
		let resolvePatch!: (value: ReturnType<typeof result>) => void;
		let ready!: () => void;
		const started = new Promise<void>((resolve) => {
			ready = resolve;
		});
		changePasswordTransport.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolvePatch = resolve;
					ready();
				}),
		);
		const context = {
			headers: new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie }),
			writes: [] as { name: string; value: string }[],
		};
		const change = passwordTestContext.run(context, () => changeOwnPassword(input));
		await started;
		jest.setSystemTime((now + 3550) * 1000);
		refresh.mockResolvedValue({
			...result('refresh'),
			user: { id: 'user-id', username: 'sample', avatarUrl: 'https://images.example/avatar' },
		});
		const refreshRequest = updateSession(cookie);
		resolvePatch(result('password'));
		const response = await refreshRequest;
		const refreshed = await decodeSession(cookiesFrom(response));
		expect((refreshed?.backendSession as { refreshToken: string }).refreshToken).toBe(
			result('refresh').refreshToken,
		);
		expect(await change).toEqual({ status: 'success' });
	});
	it('does not call backend for invalid cookie or expired absolute deadline with live token expiry', async () => {
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=invalid`,
		});
		expect(await changeOwnPassword(input)).toEqual({ status: 'unauthenticated' });
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
			throw new Error('Synthetic session missing');
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		expect(await changeOwnPassword(input)).toEqual({ status: 'unauthenticated' });
	});
	it('returns unknown for a network failure without cookie changes', async () => {
		await setupPassword();
		changePasswordTransport.mockRejectedValue(new BackendAuthError('network'));
		expect(await changeOwnPassword(input)).toEqual({ status: 'outcome-unknown' });
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([8, 255])('accepts the backend password length boundary %s', async (length) => {
		await setupPassword();
		const value = 'a'.repeat(length);
		expect(await changeOwnPassword({ password: value, passwordConfirm: value })).toEqual({
			status: 'success',
		});
	});
});

describe('settings profile selection with the private auth boundary', () => {
	const target = '11111111-1111-4111-8111-111111111111';
	const other = '22222222-2222-4222-8222-222222222222';
	const snapshot = (active: boolean) => ({
		id: 'user-id',
		email: null,
		isVerified: true,
		userRoles: [],
		profiles: [
			{ id: target, specializationId: 11, isActive: active },
			{ id: other, specializationId: 22, isActive: !active },
		],
		subscriptions: [],
	});
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	it('selects with server credentials and does not write or update the Auth.js session', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		writableCookies = false;
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot(false)), { status: 200 }))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot(true)), { status: 200 }));
		expect(await selectOwnSettingsProfile(target)).toEqual({
			status: 'success',
			profileId: target,
			specializationId: 11,
			changed: true,
		});
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			new URL(`https://backend.example/profiles/${target}/active`),
			expect.objectContaining({
				method: 'PATCH',
			}),
		);
		expectRequestHeaders(1, { Authorization: `Bearer ${token(now + 3600)}` });
		expect(jest.mocked(globalThis.fetch).mock.calls[1][1]?.body).toBeUndefined();
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it('does not PATCH an already-active profile', async () => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot(true)), { status: 200 }));
		expect(await selectOwnSettingsProfile(target)).toEqual({
			status: 'success',
			profileId: target,
			specializationId: 11,
			changed: false,
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not request settings for a guest', async () => {
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'unauthenticated' });
	});
	it('rejects expired access and session credentials before any backend request', async () => {
		await setup();
		jest.setSystemTime((now + 3601) * 1000);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'refresh-required' });
		jest.setSystemTime((now + 7201) * 1000);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'unauthenticated' });
	});
	it('rejects an expired absolute deadline with otherwise live token expiry', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		if (!decoded || !decoded.backendSession || typeof decoded.backendSession !== 'object')
			throw new Error('Synthetic session missing');
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...decoded.backendSession, sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'unauthenticated' });
	});
	it('rejects a mismatched cookie identity before backend', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: { ...decoded, sub: 'other' },
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'unauthenticated' });
	});
	it('does not PATCH a profile outside the server list', async () => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ ...snapshot(true), profiles: [] }), { status: 200 }),
			);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'not-found' });
	});
	it('returns forbidden on verification-required without logout or session update', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot(false)), { status: 200 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ message: 'auth.user.verified_required' }), { status: 403 }),
			);
		expect(await selectOwnSettingsProfile(target)).toEqual({ status: 'forbidden' });
		expect(cookieWrites).toHaveLength(0);
	});
});

describe('settings profile creation through private credentials', () => {
	const target = '11111111-1111-4111-8111-111111111111';
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	it('creates using only the trusted user identity and never updates Auth.js cookies', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		writableCookies = false;
		const before = {
			id: 'user-id',
			email: null,
			isVerified: true,
			userRoles: [],
			profiles: [],
			subscriptions: [],
		};
		const created = { id: target, userId: 'user-id', specializationId: 0, isActive: true };
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(before)))
			.mockResolvedValueOnce(new Response(JSON.stringify(created), { status: 201 }))
			.mockResolvedValueOnce(new Response(JSON.stringify({ ...before, profiles: [created] })));
		expect(createOwnSettingsProfile).toHaveLength(0);
		expect(
			await Reflect.apply(createOwnSettingsProfile, undefined, [{ userId: 'foreign' }]),
		).toEqual({ status: 'success', profileId: target });
		expect(JSON.parse(jest.mocked(globalThis.fetch).mock.calls[1][1]!.body as string)).toEqual({
			userId: 'user-id',
			profileType: 1,
			specializationId: 0,
			markingWeight: 1,
		});
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it('blocks a guest before any backend request', async () => {
		expect(await createOwnSettingsProfile()).toEqual({ status: 'unauthenticated' });
	});
	it('preserves access expiry and the absolute session deadline checks', async () => {
		await setup();
		jest.setSystemTime((now + 3601) * 1000);
		expect(await createOwnSettingsProfile()).toEqual({ status: 'refresh-required' });
		jest.setSystemTime((now + 7201) * 1000);
		expect(await createOwnSettingsProfile()).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects mismatched cookie identity before backend', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: { ...decoded, sub: 'other' },
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await createOwnSettingsProfile()).toEqual({ status: 'unauthenticated' });
	});
});

describe('settings profile deletion via trusted session', () => {
	const target = '11111111-1111-4111-8111-111111111111';
	const active = '22222222-2222-4222-8222-222222222222';
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	it('uses only the server identity, preserves Auth.js credentials and writes no cookies', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		writableCookies = false;
		const snapshot = {
			id: 'user-id',
			username: ' Name ',
			email: null,
			isVerified: true,
			userRoles: [],
			subscriptions: [],
			profiles: [
				{ id: target, isActive: false, specializationId: 11 },
				{ id: active, isActive: true, specializationId: 22 },
			],
		};
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot)))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ ...snapshot, profiles: [snapshot.profiles[1]] })),
			);
		expect(
			await Reflect.apply(deleteOwnSettingsProfile, undefined, [
				target,
				' Name ',
				{ userId: 'foreign' },
			]),
		).toEqual({ status: 'success' });
		expect(jest.mocked(globalThis.fetch).mock.calls[1]).toEqual([
			new URL(`https://backend.example/profiles/${target}`),
			expect.objectContaining({
				method: 'DELETE',
			}),
		]);
		expectRequestHeaders(1, { Authorization: `Bearer ${token(now + 3600)}` });
		expect(jest.mocked(globalThis.fetch).mock.calls[1][1]?.body).toBeUndefined();
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it('rejects a guest without backend requests', async () => {
		expect(await deleteOwnSettingsProfile(target, ' Name ')).toEqual({ status: 'unauthenticated' });
	});
	it('preserves access and session deadline checks before backend', async () => {
		await setup();
		jest.setSystemTime((now + 3601) * 1000);
		expect(await deleteOwnSettingsProfile(target, ' Name ')).toEqual({
			status: 'refresh-required',
		});
		jest.setSystemTime((now + 7201) * 1000);
		expect(await deleteOwnSettingsProfile(target, ' Name ')).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects malformed UUID before any backend request', async () => {
		await setup();
		expect(await deleteOwnSettingsProfile('invalid', ' Name ')).toEqual({
			status: 'invalid-input',
		});
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects a mismatched cookie identity without backend', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: { ...decoded, sub: 'other' },
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await deleteOwnSettingsProfile(target, ' Name ')).toEqual({ status: 'unauthenticated' });
	});
});

describe('account deletion through the private auth boundary', () => {
	const userId = '11111111-1111-4111-8111-111111111111';
	const setup = async (validIdentity = true) => {
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				...(validIdentity
					? { sub: userId, backendSession: { ...(decoded!.backendSession as object), userId } }
					: {}),
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		return `${sessionCookieName}=${value}`;
	};
	it('uses trusted UUID and fresh username, leaves credentials and cookies unchanged, and never signs out', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		writableCookies = false;
		expectedProfileFetchCalls = 2;
		const snapshot = {
			id: userId,
			username: ' Name ',
			email: null,
			isVerified: false,
			profiles: [],
			subscriptions: [
				{
					id: 'paid',
					userId,
					subscriptionId: 6,
					state: 'active',
					createDate: '2026-01-01T00:00:00.000Z',
					endDate: null,
				},
			],
			userRoles: [],
		};
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(snapshot)))
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ message: 'User deleted successfully' })),
			);
		expect(
			await Reflect.apply(deleteOwnSettingsAccount, undefined, [' Name ', { userId: 'foreign' }]),
		).toEqual({ status: 'success' });
		expect(jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname)).toEqual([
			'/auth/profile',
			`/users/${userId}`,
		]);
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it('blocks a guest without HTTP requests', async () => {
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'unauthenticated' });
	});
	it('rejects a malformed trusted identity before HTTP requests', async () => {
		await setup(false);
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'error' });
		expect(cookieWrites).toHaveLength(0);
	});
	it('rejects expired access and session deadlines before HTTP requests', async () => {
		await setup();
		jest.setSystemTime((now + 3601) * 1000);
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'refresh-required' });
		jest.setSystemTime((now + 7201) * 1000);
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'unauthenticated' });
	});
	it('rejects a cookie/identity mismatch before HTTP requests', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: { ...decoded, sub: 'foreign' },
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'unauthenticated' });
	});
	it('honors an expired absolute deadline even when access credentials have not expired', async () => {
		const cookie = await setup();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				backendSession: { ...(decoded!.backendSession as object), sessionExpiresAt: now - 1 },
			},
		});
		requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
		expect(await deleteOwnSettingsAccount(' Name ')).toEqual({ status: 'unauthenticated' });
		expect(cookieWrites).toHaveLength(0);
	});
});

describe('explicit read-only Settings page tariff composition', () => {
	const backendProfile = {
		id: 'user-id',
		username: 'Backend',
		email: null,
		isVerified: false,
		telegramUsername: null,
		profiles: [],
		subscriptions: [],
		userRoles: [{ id: 1, name: 'candidate' }],
	};
	const flag = {
		flag: 'dashboard.subscription.show-tariffs',
		clientType: 'WEB',
		enabled: true,
		roles: ['candidate'],
	};
	const flagList = (value = flag) => ({ data: [value], total: 1, page: 1, limit: 10 });
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	it('uses one trusted profile and only public read-only flag/catalog requests without changing cookies', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(flagList())))
			.mockResolvedValueOnce(new Response(JSON.stringify(backendProfile)))
			.mockResolvedValueOnce(new Response('[]'));
		const result = await getSettingsPageData();
		expect(result).toMatchObject({
			status: 'success',
			tariffs: { status: 'success', gate: { status: 'allowed', showTariffs: true }, tariffs: [] },
		});
		expect(result).not.toHaveProperty('snapshot.userRoles');
		expect(result).not.toHaveProperty('snapshot.tariffGate');
		expect(JSON.stringify(result)).not.toContain('accessToken');
		expect(jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname)).toEqual([
			'/feature-flags',
			'/auth/profile',
			'/subscriptions',
		]);
		for (const [url, options] of jest.mocked(globalThis.fetch).mock.calls) {
			expect(options?.cache).toBe('no-store');
			expect(options?.method ?? 'GET').toBe('GET');
			const headers = new Headers(options?.headers);
			expect([...headers.entries()]).toEqual(
				(url as URL).pathname === '/auth/profile'
					? [['authorization', `Bearer ${token(now + 3600)}`]]
					: [],
			);
			expect(headers.has('Cookie')).toBe(false);
			expect(options?.credentials).toBe('omit');
			expect(options?.redirect).toBe('manual');
			expect(options?.body).toBeUndefined();
		}
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it.each(['disabled', 'role-denied', 'missing', 'unavailable', 'catalog-error'])(
		'isolates %s from the rest of Settings and skips a closed catalog',
		async (kind) => {
			await setup();
			expectedProfileFetchCalls = kind === 'catalog-error' ? 3 : 2;
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							kind === 'missing'
								? { data: [], total: 0, page: 1, limit: 10 }
								: kind === 'unavailable'
									? {}
									: flagList({
											...flag,
											enabled: kind !== 'disabled',
											roles: kind === 'role-denied' ? ['admin'] : ['candidate'],
										}),
						),
					),
				)
				.mockResolvedValueOnce(new Response(JSON.stringify(backendProfile)))
				.mockResolvedValueOnce(new Response('{}', { status: 500 }));
			const result = await getSettingsPageData();
			expect(result).toMatchObject({
				status: 'success',
				tariffs:
					kind === 'catalog-error'
						? { status: 'error', reason: 'backend' }
						: { status: 'hidden', gate: { status: kind, showTariffs: false } },
			});
			expect(cookieWrites).toHaveLength(0);
		},
	);
	it.each([0, 3601, 7201])(
		'does not load page data for absent/expired credentials at %s',
		async (seconds) => {
			if (seconds) {
				await setup();
				jest.setSystemTime((now + seconds) * 1000);
			}
			expect(await getSettingsPageData()).toEqual({
				status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
			});
			expect(globalThis.fetch).not.toHaveBeenCalled();
		},
	);
	it('rejects a different profile identity before loading the catalog', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(flagList())))
			.mockResolvedValueOnce(new Response(JSON.stringify({ ...backendProfile, id: 'other' })));
		expect(await getSettingsPageData()).toEqual({ status: 'identity-mismatch' });
	});
	it('keeps the ordinary snapshot at exactly one profile request with no gate', async () => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify(backendProfile)));
		const result = await getSettingsSnapshot();
		expect(result.status).toBe('success');
		expect(result).not.toHaveProperty('tariffGate');
		expect((jest.mocked(globalThis.fetch).mock.calls[0][0] as URL).pathname).toBe('/auth/profile');
	});
});

describe('read-only payment history via existing server credentials', () => {
	const userId = '11111111-1111-4111-8111-111111111111';
	const setup = async (kind = 'valid') => {
		const cookie = await signIn();
		const decoded = await decodeSession(cookie);
		const value = await encode({
			secret: process.env.AUTH_SECRET!,
			salt: sessionCookieName,
			token: {
				...decoded,
				sub: kind === 'mismatch' ? 'other' : userId,
				backendSession: {
					...(decoded!.backendSession as object),
					userId: kind === 'invalid-uuid' ? 'invalid' : userId,
				},
			},
		});
		requestHeaders = new Headers({
			host: 'site.example',
			'x-forwarded-proto': 'https',
			cookie: `${sessionCookieName}=${value}`,
		});
		return `${sessionCookieName}=${value}`;
	};
	it('loads the initial page with one GET, no profile read, cookies, auth update or private output', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(
			new Response(
				JSON.stringify({
					data: [{ createdAt: '2026-02-01T00:00:00Z', status: null, rebillId: 'private' }],
					page: 1,
					limit: 5,
					total: 1,
				}),
			),
		);
		expect(await getSettingsPaymentHistory()).toEqual({
			status: 'success',
			items: [{ dateLabel: '1 февраля 2026', isConfirmed: false }],
			page: 1,
			limit: 5,
			total: 1,
		});
		const [url, options] = jest.mocked(globalThis.fetch).mock.calls[0];
		expect((url as URL).pathname).toBe(`/payments/${userId}`);
		expect((url as URL).search).toBe('?page=1&limit=5');
		expect(options?.method).toBe('GET');
		expect(profile).not.toHaveBeenCalled();
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it('ignores injected client identity and limit when loading another page', async () => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValue(new Response(JSON.stringify({ data: [], page: 2, limit: 5, total: 0 })));
		expect(
			await Reflect.apply(getSettingsPaymentHistory, null, [
				2,
				{ userId: 'foreign', limit: 100, accessToken: 'foreign' },
			]),
		).toMatchObject({ status: 'success', page: 2, limit: 5 });
		const url = jest.mocked(globalThis.fetch).mock.calls[0][0] as URL;
		expect(url.pathname).toBe(`/payments/${userId}`);
		expect(url.searchParams.get('limit')).toBe('5');
	});
	it.each([0, 3601, 7201])(
		'does not fetch for guest or expired credentials at %s',
		async (seconds) => {
			if (seconds) {
				await setup();
				jest.setSystemTime((now + seconds) * 1000);
			}
			expect(await getSettingsPaymentHistory()).toEqual({
				status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
			});
			expect(globalThis.fetch).not.toHaveBeenCalled();
		},
	);
	it.each(['mismatch', 'invalid-uuid'])(
		'rejects invalid identity %s without HTTP',
		async (kind) => {
			await setup(kind);
			expect(await getSettingsPaymentHistory()).toEqual({ status: 'unauthenticated' });
			expect(globalThis.fetch).not.toHaveBeenCalled();
		},
	);
	it.each([0, '2', { userId, page: 1, limit: 100 }])(
		'rejects invalid page %# without HTTP',
		async (page) => {
			await setup();
			expect(await getSettingsPaymentHistory(page)).toEqual({ status: 'invalid-input' });
			expect(globalThis.fetch).not.toHaveBeenCalled();
		},
	);
	it.each([401, 403, 500])('preserves session on payment HTTP %s', async (status) => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(new Response('{}', { status }));
		expect(await getSettingsPaymentHistory()).toEqual({
			status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
		});
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
});

describe('trial activation with fresh server eligibility and confirmed readback', () => {
	const before = {
		id: 'user-id',
		username: 'Backend',
		email: 'synthetic@example.invalid',
		isVerified: true,
		userRoles: [],
		profiles: [],
		subscriptions: [],
	};
	const trial = (
		state = 'active',
		endDate: string | null = '2030-02-01T00:00:00.000Z',
		id = 'trial',
	) => ({
		id,
		userId: 'user-id',
		subscriptionId: 4,
		state,
		createDate: '2026-01-01T00:00:00.000Z',
		endDate,
	});
	const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	const paths = () =>
		jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname);
	it('performs two profile GETs and one mutation, preserves session and never modifies other subscriptions', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		expectedProfileFetchCalls = 3;
		const other = { ...trial(), id: 'other', subscriptionId: 7, state: 'inactive' };
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json({ ...before, subscriptions: [other] }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(
				json({ ...before, userRoles: undefined, subscriptions: [other, trial()] }),
			);
		expect(startOwnSettingsTrial.length).toBe(0);
		expect(
			await Reflect.apply(startOwnSettingsTrial, null, [
				{ userId: 'foreign', duration: 100, accessToken: 'foreign' },
			]),
		).toEqual({ status: 'success' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/trial', '/auth/profile']);
		for (const [url, options] of jest.mocked(globalThis.fetch).mock.calls) {
			expect(options?.method ?? 'GET').toBe('GET');
			expect(options?.cache).toBe('no-store');
			expect(options?.body).toBeUndefined();
			if ((url as URL).pathname === '/subscriptions/trial') expect((url as URL).search).toBe('');
		}
		expect(cookieWrites).toHaveLength(0);
		expect(await decodeSession(cookie)).toEqual(original);
	});
	it.each([0, 3601, 7201])(
		'rejects guest/expired session before any request at %s',
		async (seconds) => {
			if (seconds) {
				await setup();
				jest.setSystemTime((now + seconds) * 1000);
			}
			expect(await startOwnSettingsTrial()).toEqual({
				status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
			});
			expect(globalThis.fetch).not.toHaveBeenCalled();
		},
	);
	it.each([
		{ patch: { id: 'other' }, expected: 'error' },
		{ patch: { isVerified: false }, expected: 'verification-required' },
		{ patch: { userRoles: [{ id: 2, name: 'candidate-premium' }] }, expected: 'not-eligible' },
		{ patch: { userRoles: undefined }, expected: 'not-eligible' },
		{ patch: { userRoles: [{}] }, expected: 'error' },
		...['active', 'inactive', 'canceled', 'pending_payment'].map((state) => ({
			patch: { subscriptions: [trial(state)] },
			expected: 'not-eligible',
		})),
	])('uses fresh eligibility instead of stale page props %#', async ({ patch, expected }) => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(json({ ...before, ...patch }));
		expect(await startOwnSettingsTrial()).toEqual({ status: expected });
		expect(paths()).toEqual(['/auth/profile']);
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[500, 'error'],
	] as const)('does not mutate after pre-read HTTP %s', async (status, expected) => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValue(json({}, status));
		expect(await startOwnSettingsTrial()).toEqual({ status: expected });
	});
	it.each([
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[404, 'error'],
		[409, 'conflict'],
		[500, 'outcome-unknown'],
	] as const)('does not retry mutation HTTP %s', async (status, expected) => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status }));
		expect(await startOwnSettingsTrial()).toEqual({ status: expected });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/trial']);
		expect(cookieWrites).toHaveLength(0);
	});
	it('does not retry an unknown network outcome', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockRejectedValueOnce(new Error('Private connection failure'));
		expect(await startOwnSettingsTrial()).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/trial']);
	});
	it('bounds a hanging mutation without retry or readback', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		let dispatched!: () => void;
		const started = new Promise<void>((resolve) => {
			dispatched = resolve;
		});
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockImplementationOnce(() => {
				dispatched();
				return new Promise(() => {});
			});
		const result = startOwnSettingsTrial();
		await started;
		await jest.advanceTimersByTimeAsync(5000);
		expect(await result).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/trial']);
	});
	it.each([
		{ ...before, subscriptions: [] },
		{ ...before, id: 'other', subscriptions: [trial()] },
		{ ...before, subscriptions: [trial('inactive')] },
		{ ...before, subscriptions: [trial('active', null)] },
		{ ...before, subscriptions: [trial('active', '2020-01-01T00:00:00Z')] },
		{ ...before, subscriptions: [trial('active', 'invalid')] },
		{ ...before, subscriptions: [trial(), trial('canceled', '2030-01-01T00:00:00Z', 'duplicate')] },
	])('returns incomplete rather than retrying an unconfirmed readback %#', async (after) => {
		await setup();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(json(after));
		expect(await startOwnSettingsTrial()).toEqual({ status: 'incomplete' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/trial', '/auth/profile']);
	});
	it.each([3601, 7201])(
		'rechecks credential/deadline expiry after pre-read at +%s',
		async (seconds) => {
			await setup();
			expectedProfileFetchCalls = 1;
			jest.mocked(globalThis.fetch).mockImplementationOnce(() => {
				jest.setSystemTime((now + seconds) * 1000);
				return Promise.resolve(json(before));
			});
			expect(await startOwnSettingsTrial()).toEqual({
				status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
			});
			expect(paths()).toEqual(['/auth/profile']);
		},
	);
});

it.each([401, 403, 500])(
	'keeps trial HTTP 200 followed by readback HTTP %s incomplete without replay',
	async (status) => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		expectedProfileFetchCalls = 3;
		const before = {
			id: 'user-id',
			username: 'Backend',
			email: null,
			isVerified: true,
			userRoles: [],
			profiles: [],
			subscriptions: [],
		};
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response(JSON.stringify(before)))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(new Response('{}', { status }));
		expect(await startOwnSettingsTrial()).toEqual({ status: 'incomplete' });
		expect(jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname)).toEqual([
			'/auth/profile',
			'/subscriptions/trial',
			'/auth/profile',
		]);
		expect(cookieWrites).toHaveLength(0);
	},
);

describe('payment initialization server boundary', () => {
	afterEach(() => expect(cookieWrites).toHaveLength(0));
	const input = {
		tariffId: 2,
		email: 'client+receipt@example.invalid',
		isOfferAgreed: true,
		isConsentAgreed: true,
	};
	const before = {
		id: 'user-id',
		email: 'server@example.invalid',
		isVerified: true,
		userRoles: [],
		profiles: [],
		subscriptions: [],
	};
	const flag = (enabled = true, roles: string[] = []) => ({
		data: [{ flag: 'dashboard.subscription.show-tariffs', clientType: 'WEB', enabled, roles }],
		page: 1,
		limit: 10,
		total: 1,
	});
	const tariff = (id = 2, code = 'month', isActive = true) => ({
		id,
		code,
		isActive,
		finalPrice: 800,
		pricePerMonth: 800,
		discount: 0,
		monthPeriod: 1,
	});
	const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
	const paths = () =>
		jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname);
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	const mockReads = (profileData: unknown = before, flagData = flag(), tariffs = [tariff()]) => {
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(flagData))
			.mockResolvedValueOnce(json(profileData))
			.mockResolvedValueOnce(json(tariffs));
	};
	it.each(['month', 'quarter', 'year'])(
		'initializes %s once with fresh data and keeps credentials server-only',
		async (code) => {
			const cookie = await setup();
			const original = await decodeSession(cookie);
			expectedProfileFetchCalls = 4;
			mockReads(before, flag(), [tariff(2, code)]);
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValueOnce(new Response('https://securepay.tinkoff.ru/new/synthetic'));
			expect(await initializeOwnSettingsPayment(input)).toEqual({
				status: 'success',
				paymentUrl: 'https://securepay.tinkoff.ru/new/synthetic',
			});
			expect(paths()).toEqual([
				'/feature-flags',
				'/auth/profile',
				'/subscriptions',
				'/subscriptions/2/payment/init',
			]);
			const [url] = jest.mocked(globalThis.fetch).mock.calls[3];
			expect((url as URL).searchParams.get('email')).toBe('server@example.invalid');
			expectRequestHeaders(3, { Authorization: `Bearer ${token(now + 3600)}` });
			expect(cookieWrites).toHaveLength(0);
			expect((await decodeSession(cookie))?.backendSession).toEqual(original?.backendSession);
		},
	);
	it.each(['guest', 'expired', 'deadline', 'identity', 'cookie'])(
		'rejects %s before backend calls',
		async (kind) => {
			if (kind !== 'guest') {
				const cookie = await setup();
				if (kind === 'expired') jest.setSystemTime((now + 3601) * 1000);
				if (kind === 'deadline') jest.setSystemTime((now + 7201) * 1000);
				if (kind === 'cookie') requestHeaders.set('cookie', 'damaged-cookie-value');
				if (kind === 'identity') {
					const decoded = await decodeSession(cookie);
					const value = await encode({
						secret: process.env.AUTH_SECRET!,
						salt: sessionCookieName,
						token: { ...decoded, sub: 'other' },
					});
					requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
				}
			}
			expect(await initializeOwnSettingsPayment(input)).toEqual({
				status: kind === 'expired' ? 'refresh-required' : 'unauthenticated',
			});
		},
	);
	it.each([
		{ ...input, tariffId: '2' },
		{ ...input, isOfferAgreed: false },
		{ ...input, isConsentAgreed: false },
		{ ...input, email: 'invalid' },
		{ ...input, userId: 'other' },
	])('rejects malformed input without any backend request %#', async (value) => {
		await setup();
		expect(await initializeOwnSettingsPayment(value as typeof input)).toEqual({
			status: 'invalid-input',
		});
	});
	it.each([
		{ patch: { id: 'other' }, status: 'error' },
		{ patch: { isVerified: false }, status: 'verification-required' },
	])('rejects invalid fresh profile %#', async ({ patch, status }) => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(flag()))
			.mockResolvedValueOnce(json({ ...before, ...patch }));
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status });
	});
	it.each([flag(false), flag(true, ['admin']), { data: [], page: 1, limit: 10, total: 0 }, {}])(
		'fails closed for gate %#',
		async (value) => {
			await setup();
			expectedProfileFetchCalls = 2;
			jest
				.mocked(globalThis.fetch)
				.mockResolvedValueOnce(json(value))
				.mockResolvedValueOnce(json(before));
			expect(await initializeOwnSettingsPayment(input)).toEqual({ status: 'not-available' });
		},
	);
	it.each([
		{ tariffs: [tariff(7)] },
		{ tariffs: [tariff(2, 'month', false)] },
		{ tariffs: [tariff(2, 'free')] },
		{ tariffs: [tariff(2, 'trial')] },
	])('rejects unavailable tariff %#', async ({ tariffs }) => {
		await setup();
		expectedProfileFetchCalls = 3;
		mockReads(before, flag(), tariffs);
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status: 'not-available' });
	});
	it('uses the submitted receipt email when the server email is absent', async () => {
		await setup();
		expectedProfileFetchCalls = 4;
		mockReads({ ...before, email: null });
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response('https://securepay.tinkoff.ru/new/synthetic'));
		expect((await initializeOwnSettingsPayment(input)).status).toBe('success');
		expect((jest.mocked(globalThis.fetch).mock.calls[3][0] as URL).search).toBe(
			'?email=client%2Breceipt%40example.invalid',
		);
	});
	it.each([3601, 7201])('rechecks deadlines immediately before Init +%s', async (seconds) => {
		await setup();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(flag()))
			.mockResolvedValueOnce(json(before))
			.mockImplementationOnce(() => {
				jest.setSystemTime((now + seconds) * 1000);
				return Promise.resolve(json([tariff()]));
			});
		expect(await initializeOwnSettingsPayment(input)).toEqual({
			status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
		});
	});
	it.each([
		[400, 'error'],
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[404, 'not-available'],
		[409, 'conflict'],
		[500, 'outcome-unknown'],
	] as const)('does not replay Init after HTTP %s', async (status, expected) => {
		await setup();
		expectedProfileFetchCalls = 4;
		mockReads();
		jest.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(null, { status }));
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status: expected });
		expect(paths().filter((path) => path.endsWith('/payment/init'))).toHaveLength(1);
		expect(cookieWrites).toHaveLength(0);
	});
	it.each([401, 403, 500])('does not initialize after profile HTTP %s', async (status) => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(flag()))
			.mockResolvedValueOnce(json({}, status));
		expect(await initializeOwnSettingsPayment(input)).toEqual({
			status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
		});
	});
	it('does not initialize after malformed catalog or invalid server email', async () => {
		await setup();
		expectedProfileFetchCalls = 3;
		mockReads(before, flag(), [{ ...tariff(), finalPrice: -1 }]);
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status: 'error' });
		jest.mocked(globalThis.fetch).mockClear();
		mockReads({ ...before, email: 'invalid' });
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status: 'invalid-input' });
	});
	it('does not retry a network failure after Init dispatch', async () => {
		await setup();
		expectedProfileFetchCalls = 4;
		mockReads();
		jest.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Private connection failure'));
		expect(await initializeOwnSettingsPayment(input)).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual([
			'/feature-flags',
			'/auth/profile',
			'/subscriptions',
			'/subscriptions/2/payment/init',
		]);
	});
	it('does not replay or read back a hanging Init after 45 seconds', async () => {
		await setup();
		expectedProfileFetchCalls = 4;
		mockReads();
		let dispatch!: () => void;
		const started = new Promise<void>((resolve) => {
			dispatch = resolve;
		});
		jest.mocked(globalThis.fetch).mockImplementationOnce(() => {
			dispatch();
			return new Promise(() => {});
		});
		const result = initializeOwnSettingsPayment(input);
		await started;
		await jest.advanceTimersByTimeAsync(45000);
		expect(await result).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual([
			'/feature-flags',
			'/auth/profile',
			'/subscriptions',
			'/subscriptions/2/payment/init',
		]);
	});
	it('does not add subscription or active-profile restrictions or mutate trial independently', async () => {
		await setup();
		expectedProfileFetchCalls = 4;
		const data = {
			...before,
			subscriptions: [
				{
					id: 'synthetic-trial',
					userId: 'user-id',
					subscriptionId: 4,
					state: 'active',
					createDate: '2026-01-01T00:00:00Z',
					endDate: '2030-01-01T00:00:00Z',
				},
			],
		};
		mockReads(data);
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(new Response('https://securepay.tinkoff.ru/new/synthetic'));
		expect((await initializeOwnSettingsPayment(input)).status).toBe('success');
		expect(paths()).toEqual([
			'/feature-flags',
			'/auth/profile',
			'/subscriptions',
			'/subscriptions/2/payment/init',
		]);
	});
});

describe('subscription cancellation server boundary', () => {
	const id = '22222222-2222-4222-8222-222222222222';
	const otherId = '33333333-3333-4333-8333-333333333333';
	const subscription = {
		id,
		userId: 'user-id',
		subscriptionId: 2,
		state: 'active',
		createDate: '2026-02-01T00:00:00Z',
		endDate: '2030-04-01T00:00:00Z',
	};
	const before = {
		id: 'user-id',
		email: 'synthetic@example.invalid',
		isVerified: true,
		profiles: [],
		subscriptions: [subscription],
	};
	const after = { ...before, subscriptions: [{ ...subscription, state: 'canceled' }] };
	const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
	const paths = () =>
		jest.mocked(globalThis.fetch).mock.calls.map(([url]) => (url as URL).pathname);
	const setup = async () => {
		const cookie = await signIn();
		requestHeaders = new Headers({ host: 'site.example', 'x-forwarded-proto': 'https', cookie });
		return cookie;
	};
	afterEach(() => expect(cookieWrites).toHaveLength(0));
	it('cancels the displayed subscription, ignores newer pending_payment, confirms readback and preserves session', async () => {
		const cookie = await setup();
		const original = await decodeSession(cookie);
		expectedProfileFetchCalls = 3;
		const pending = {
			...subscription,
			id: otherId,
			subscriptionId: 3,
			state: 'pending_payment',
			createDate: '2029-01-01T00:00:00Z',
			endDate: null,
		};
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json({ ...before, subscriptions: [pending, subscription] }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(json({ ...after, subscriptions: [pending, ...after.subscriptions] }));
		const result = await cancelOwnSettingsSubscription(id);
		expect(result).toMatchObject({
			status: 'success',
			subscription: { state: 'canceled', daysInCreationMonth: 28, endDateLabel: '1 апреля 2030' },
		});
		expect(Object.keys(result).sort()).toEqual(['status', 'subscription']);
		if (result.status === 'success')
			expect(Object.keys(result.subscription).sort()).toEqual([
				'daysInCreationMonth',
				'daysLeft',
				'endDateLabel',
				'state',
			]);
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users', '/auth/profile']);
		const [, options] = jest.mocked(globalThis.fetch).mock.calls[1];
		expect(options?.method).toBe('DELETE');
		expect(JSON.parse(options!.body as string)).toEqual({ userId: 'user-id', subscriptionId: 2 });
		expectRequestHeaders(1, {
			Authorization: `Bearer ${token(now + 3600)}`,
			'Content-Type': 'application/json',
		});
		expect((await decodeSession(cookie))?.backendSession).toEqual(original?.backendSession);
	});
	it.each(['guest', 'expired', 'deadline', 'identity', 'cookie'])(
		'rejects %s without backend requests',
		async (kind) => {
			if (kind !== 'guest') {
				const cookie = await setup();
				if (kind === 'expired') jest.setSystemTime((now + 3601) * 1000);
				if (kind === 'deadline') jest.setSystemTime((now + 7201) * 1000);
				if (kind === 'cookie') requestHeaders.set('cookie', 'damaged-cookie-value');
				if (kind === 'identity') {
					const decoded = await decodeSession(cookie);
					const value = await encode({
						secret: process.env.AUTH_SECRET!,
						salt: sessionCookieName,
						token: { ...decoded, sub: 'other' },
					});
					requestHeaders.set('cookie', `${sessionCookieName}=${value}`);
				}
			}
			expect(await cancelOwnSettingsSubscription(id)).toEqual({
				status: kind === 'expired' ? 'refresh-required' : 'unauthenticated',
			});
		},
	);
	it.each([null, 2, '', 'invalid', '22222222-2222-4222-8222-22222222222Z'])(
		'rejects invalid expected UUID before backend %#',
		async (value) => {
			await setup();
			expect(await cancelOwnSettingsSubscription(value as string)).toEqual({
				status: 'invalid-input',
			});
		},
	);
	it.each([
		{ value: { ...before, id: 'other' }, status: 'error' },
		{ value: { ...before, isVerified: false }, status: 'verification-required' },
		{ value: { ...before, subscriptions: [] }, status: 'not-available' },
		{ value: after, status: 'not-available' },
		{
			value: { ...before, subscriptions: [{ ...subscription, endDate: '2020-01-01T00:00:00Z' }] },
			status: 'not-available',
		},
		{
			value: { ...before, subscriptions: [{ ...subscription, endDate: null }] },
			status: 'not-available',
		},
		{
			value: { ...before, subscriptions: [{ ...subscription, state: 'pending_payment' }] },
			status: 'not-available',
		},
		{ value: { ...before, subscriptions: [{ ...subscription, id: otherId }] }, status: 'conflict' },
		{
			value: {
				...before,
				subscriptions: [{ ...subscription, state: 'canceled', id: otherId }, subscription],
			},
			status: 'not-available',
		},
	])('rejects unsafe fresh snapshot %# with zero DELETE', async ({ value, status }) => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValueOnce(json(value));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status });
		expect(paths()).toEqual(['/auth/profile']);
	});
	it.each([3601, 7201])('rechecks credentials and deadline after snapshot +%s', async (seconds) => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockImplementationOnce(() => {
			jest.setSystemTime((now + seconds) * 1000);
			return Promise.resolve(json(before));
		});
		expect(await cancelOwnSettingsSubscription(id)).toEqual({
			status: seconds === 3601 ? 'refresh-required' : 'unauthenticated',
		});
	});
	it.each([
		[400, 'error'],
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[404, 'not-available'],
		[409, 'conflict'],
		[500, 'outcome-unknown'],
		[204, 'outcome-unknown'],
	] as const)('does not read back or retry DELETE HTTP %s', async (status, expected) => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status }));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status: expected });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users']);
	});
	it.each([
		{ ...after, id: 'other' },
		{ ...after, subscriptions: [] },
		before,
		{ ...after, subscriptions: [{ ...after.subscriptions[0], id: otherId }] },
		{ ...after, subscriptions: [{ ...after.subscriptions[0], subscriptionId: 3 }] },
		{ ...after, subscriptions: [{ ...after.subscriptions[0], endDate: '2031-01-01T00:00:00Z' }] },
		{ ...after, subscriptions: [{ ...after.subscriptions[0], endDate: null }] },
		{ ...after, subscriptions: [{ ...after.subscriptions[0], createDate: 'invalid' }] },
	])('returns incomplete for contradictory readback %# without retry', async (value) => {
		await setup();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(json(value));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status: 'incomplete' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users', '/auth/profile']);
	});
	it.each([401, 403, 500])('keeps failed readback HTTP %s incomplete', async (status) => {
		await setup();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(json({}, status));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status: 'incomplete' });
	});
	it('keeps a lost DELETE response unknown with one mutation', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockRejectedValueOnce(new Error('Private failure'));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users']);
	});
	it('does not replay after the five-second DELETE timeout', async () => {
		await setup();
		expectedProfileFetchCalls = 2;
		let dispatch!: () => void;
		const started = new Promise<void>((resolve) => {
			dispatch = resolve;
		});
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockImplementationOnce(() => {
				dispatch();
				return new Promise(() => {});
			});
		const result = cancelOwnSettingsSubscription(id);
		await started;
		await jest.advanceTimersByTimeAsync(5000);
		expect(await result).toEqual({ status: 'outcome-unknown' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users']);
	});
	it.each([401, 403, 500])('refuses pre-read HTTP %s with zero DELETE', async (status) => {
		await setup();
		expectedProfileFetchCalls = 1;
		jest.mocked(globalThis.fetch).mockResolvedValueOnce(json({}, status));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({
			status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
		});
		expect(paths()).toEqual(['/auth/profile']);
	});
	it('returns incomplete for network failure during readback without replay', async () => {
		await setup();
		expectedProfileFetchCalls = 3;
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockRejectedValueOnce(new Error('Private readback failure'));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({ status: 'incomplete' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users', '/auth/profile']);
	});
	it('bounds a hanging readback and keeps HTTP 200 cancellation incomplete', async () => {
		await setup();
		expectedProfileFetchCalls = 3;
		let dispatch!: () => void;
		const started = new Promise<void>((resolve) => {
			dispatch = resolve;
		});
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockImplementationOnce(() => {
				dispatch();
				return new Promise(() => {});
			});
		const result = cancelOwnSettingsSubscription(id);
		await started;
		await jest.advanceTimersByTimeAsync(5000);
		expect(await result).toEqual({ status: 'incomplete' });
		expect(paths()).toEqual(['/auth/profile', '/subscriptions/users', '/auth/profile']);
	});
	it('allows endDate equal to now and returns the existing zero-day projection', async () => {
		await setup();
		expectedProfileFetchCalls = 3;
		const value = { ...subscription, endDate: new Date(now * 1000).toISOString() };
		jest
			.mocked(globalThis.fetch)
			.mockResolvedValueOnce(json({ ...before, subscriptions: [value] }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(json({ ...before, subscriptions: [{ ...value, state: 'canceled' }] }));
		expect(await cancelOwnSettingsSubscription(id)).toEqual({
			status: 'success',
			subscription: {
				state: 'canceled',
				daysLeft: 0,
				daysInCreationMonth: 28,
				endDateLabel: '15 января 2027',
			},
		});
	});
});
