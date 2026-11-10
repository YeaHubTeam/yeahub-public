import NextAuth from 'next-auth';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';

import { GET, POST, runtime } from './app/api/auth/[...nextauth]/route';
import { auth, handlers, signIn, signOut } from './auth';
import { AuthRefreshError, refreshAuthCredentials } from './lib/authRefresh.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('next-auth', () => ({
	__esModule: true,
	default: jest.fn(() => ({
		handlers: { GET: jest.fn(), POST: jest.fn() },
		auth: jest.fn(),
		signIn: jest.fn(),
		signOut: jest.fn(),
	})),
}));
jest.mock('next-auth/providers/credentials', () => ({
	__esModule: true,
	default: jest.fn((options: object) => ({ type: 'credentials', ...options })),
}));
jest.mock('@/shared/config/authBackend.server', () => ({ getAuthBackendConfig: jest.fn() }));
jest.mock('@/entities/auth/server', () => {
	class MockBackendAuthError extends Error {
		constructor(
			public kind: string,
			public status?: number,
		) {
			super('Synthetic backend error');
		}
	}
	return { BackendAuthError: MockBackendAuthError, createBackendAuthTransport: jest.fn() };
});

jest.mock('./lib/authRefresh.server', () => ({
	AuthRefreshError: class extends Error {
		constructor(public code: string) {
			super('Synthetic refresh error');
		}
	},
	refreshAuthCredentials: jest.fn(),
}));

const now = 1_800_000_000;
const jwtToken = (exp: number) =>
	`synthetic.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const login = jest.fn();
const refresh = jest.fn();
const profile = jest.fn();
const logout = jest.fn();
const result = {
	access_token: jwtToken(now + 3600),
	refreshToken: jwtToken(now + 7200),
	user: {
		id: 'user-id',
		username: 'sample',
		avatarUrl: 'https://images.example/avatar',
		userRoles: [],
		privateExtra: 'must-not-copy',
	},
};
const serverConfig = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
	allowLocalHttp: false,
};

const configuration = async () => {
	const factory = jest.mocked(NextAuth).mock.calls[0][0];
	if (typeof factory !== 'function') throw new Error('Expected lazy configuration');
	const config = await factory(undefined);
	const provider = config.providers[0];
	if (typeof provider === 'function' || provider.type !== 'credentials')
		throw new Error('Expected Credentials');
	const jwt = config.callbacks?.jwt;
	const session = config.callbacks?.session;
	if (!jwt || !session) throw new Error('Missing callbacks');
	return { config, provider, jwt, session };
};

beforeEach(() => {
	jest.useFakeTimers().setSystemTime(now * 1000);
	login.mockReset().mockResolvedValue(result);
	refresh.mockReset();
	jest.mocked(refreshAuthCredentials).mockReset();
	profile.mockReset();
	logout.mockReset();
	jest.mocked(getAuthBackendConfig).mockReset().mockReturnValue(serverConfig);
	jest
		.mocked(createBackendAuthTransport)
		.mockReset()
		.mockReturnValue({ login, refresh, profile, logout });
	jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Real fetch forbidden'));
});
afterEach(() => {
	expect(globalThis.fetch).not.toHaveBeenCalled();
	expect(refresh).not.toHaveBeenCalled();
	expect(profile).not.toHaveBeenCalled();
	expect(logout).not.toHaveBeenCalled();
	jest.restoreAllMocks();
	jest.useRealTimers();
});

describe('Auth.js server configuration', () => {
	it('exports Auth.js APIs and existing Node route handlers', () => {
		expect(auth).toEqual(expect.any(Function));
		expect(signIn).toEqual(expect.any(Function));
		expect(signOut).toEqual(expect.any(Function));
		expect(GET).toBe(handlers.GET);
		expect(POST).toBe(handlers.POST);
		expect(runtime).toBe('nodejs');
	});
	it('does not read backend configuration or create transport during setup', async () => {
		const { config } = await configuration();
		expect(config.session).toEqual({ strategy: 'jwt', maxAge: 604800 });
		expect(config.debug).toBe(false);
		expect(getAuthBackendConfig).not.toHaveBeenCalled();
		expect(createBackendAuthTransport).not.toHaveBeenCalled();
	});
	it('authorizes through the public transport and validated server config', async () => {
		const { provider } = await configuration();
		const authorized = await provider.authorize(
			{ username: 'sample@example.com', password: ' synthetic-password ' },
			new Request('https://site.example'),
		);
		expect(createBackendAuthTransport).toHaveBeenCalledWith(serverConfig);
		expect(login).toHaveBeenCalledWith({
			username: 'sample@example.com',
			password: ' synthetic-password ',
		});
		expect(authorized?.id).toBe('user-id');
		expect(JSON.stringify(authorized)).not.toContain('synthetic-password');
		expect(JSON.stringify(authorized)).not.toContain('must-not-copy');
	});
	it.each([
		{},
		{ username: '', password: 'x' },
		{ username: '   ', password: 'x' },
		{ username: 1, password: 'x' },
		{ username: 'x', password: '' },
		{ username: 'x', password: ' ' },
		{ username: 'x', password: null },
	])('rejects invalid credentials %j before transport creation', async (credentials) => {
		const { provider } = await configuration();
		await expect(
			provider.authorize(credentials, new Request('https://site.example')),
		).resolves.toBeNull();
		expect(login).not.toHaveBeenCalled();
		expect(getAuthBackendConfig).not.toHaveBeenCalled();
	});
	it('returns null for backend credential rejection', async () => {
		const { provider } = await configuration();
		login.mockRejectedValue(new BackendAuthError('http', 401));
		await expect(
			provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).resolves.toBeNull();
	});
	it.each(['network', 'configuration', 'protocol'] as const)(
		'propagates %s failure without successful login',
		async (kind) => {
			const { provider } = await configuration();
			const error = new BackendAuthError(kind);
			login.mockRejectedValue(error);
			await expect(
				provider.authorize(
					{ username: 'sample', password: 'synthetic' },
					new Request('https://site.example'),
				),
			).rejects.toBe(error);
		},
	);
	it.each([403, 500])('does not disguise backend status %s as wrong password', async (status) => {
		const { provider } = await configuration();
		const error = new BackendAuthError('http', status);
		login.mockRejectedValue(error);
		await expect(
			provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).rejects.toBe(error);
	});
	it('propagates invalid environment configuration without requesting login', async () => {
		const { provider } = await configuration();
		const error = new Error('Invalid server configuration');
		jest.mocked(getAuthBackendConfig).mockImplementation(() => {
			throw error;
		});
		await expect(
			provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).rejects.toBe(error);
		expect(login).not.toHaveBeenCalled();
	});
	it('propagates factory configuration errors', async () => {
		const { provider } = await configuration();
		const error = new BackendAuthError('configuration');
		jest.mocked(createBackendAuthTransport).mockImplementation(() => {
			throw error;
		});
		await expect(
			provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).rejects.toBe(error);
	});
	it('whitelists JWT and Session fields and ignores client update payloads', async () => {
		const { provider, jwt, session } = await configuration();
		const authorized = await provider.authorize(
			{ username: 'sample', password: 'synthetic-password' },
			new Request('https://site.example'),
		);
		if (!authorized) throw new Error('Expected backend user');
		const internal = await jwt({
			token: { password: 'must-not-copy', accessToken: 'must-not-copy' },
			user: authorized,
			trigger: 'signIn',
		});
		expect(internal).toEqual({
			sub: 'user-id',
			backendSession: {
				userId: 'user-id',
				username: 'sample',
				avatarUrl: result.user.avatarUrl,
				accessToken: result.access_token,
				refreshToken: result.refreshToken,
				accessExpiresAt: now + 3600,
				refreshExpiresAt: now + 7200,
				sessionExpiresAt: now + 7200,
			},
		});
		if (!internal) throw new Error('Expected internal JWT');
		expect(
			await jwt({
				token: internal,
				user: {},
				trigger: 'update',
				session: {
					backendSession: {
						accessToken: 'injected',
						accessExpiresAt: now + 999999,
						refreshExpiresAt: now + 999999,
						sessionExpiresAt: now + 999999,
					},
				},
			}),
		).toEqual(internal);
		const output = await Reflect.apply(session, undefined, [
			{ token: internal, session: { accessToken: 'must-not-copy' } },
		]);
		expect(output).toEqual({
			user: { id: 'user-id', username: 'sample', image: result.user.avatarUrl },
			expires: new Date((now + 7200) * 1000).toISOString(),
			requiresRefresh: false,
		});
		for (const secret of [
			result.access_token,
			result.refreshToken,
			'synthetic-password',
			'must-not-copy',
		])
			expect(JSON.stringify(output)).not.toContain(secret);
		expect(JSON.stringify(internal)).not.toContain('synthetic-password');
		expect(JSON.stringify(internal)).not.toContain('must-not-copy');
		jest.setSystemTime((now + 3600) * 1000);
		expect(await jwt({ token: internal, user: {} })).toEqual(internal);
		expect(Reflect.apply(session, undefined, [{ token: internal }])).toMatchObject({
			requiresRefresh: true,
		});
		jest.setSystemTime((now + 7200) * 1000);
		expect(await jwt({ token: internal, user: {} })).toBeNull();
		expect(() => Reflect.apply(session, undefined, [{ token: internal }])).toThrow('expired');
		expect(login).toHaveBeenCalledTimes(1);
	});
	it('supports a null avatar', async () => {
		const { provider } = await configuration();
		login.mockResolvedValue({ ...result, user: { ...result.user, avatarUrl: null } });
		expect(
			await provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).not.toBeNull();
	});
	it.each(['opaque', jwtToken(now), jwtToken(now - 1), 'synthetic.e30.signature'])(
		'rejects missing or expired expiry metadata %s',
		async (accessToken) => {
			const { provider } = await configuration();
			login.mockResolvedValue({ ...result, access_token: accessToken });
			await expect(
				provider.authorize(
					{ username: 'sample', password: 'synthetic' },
					new Request('https://site.example'),
				),
			).rejects.toMatchObject({ kind: 'protocol' });
		},
	);
	it('rejects an expired refresh token without attempting refresh', async () => {
		const { provider } = await configuration();
		login.mockResolvedValue({ ...result, refreshToken: jwtToken(now) });
		await expect(
			provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			),
		).rejects.toMatchObject({ kind: 'protocol' });
	});
	it('rejects absent internal JWT data', async () => {
		const { jwt, session } = await configuration();
		expect(await jwt({ token: {}, user: {} })).toBeNull();
		expect(() => Reflect.apply(session, undefined, [{ token: {} }])).toThrow();
	});
	it('caps the absolute session duration rather than trusting rolling cookie lifetime', async () => {
		const { provider, jwt } = await configuration();
		login.mockResolvedValue({
			...result,
			access_token: jwtToken(now + 172800),
			refreshToken: jwtToken(now + 864000),
		});
		const authorized = await provider.authorize(
			{ username: 'sample', password: 'synthetic' },
			new Request('https://site.example'),
		);
		if (!authorized) throw new Error();
		const internal = await jwt({ token: {}, user: authorized });
		if (!internal) throw new Error();
		expect(internal.backendSession).toMatchObject({ sessionExpiresAt: now + 604800 });
		jest.setSystemTime((now + 604799) * 1000);
		expect(await jwt({ token: internal, user: {} })).toEqual(internal);
		jest.setSystemTime((now + 604800) * 1000);
		expect(await jwt({ token: internal, user: {} })).toBeNull();
	});
	it('preserves stored deadlines for legacy sessions and expires refresh independently', async () => {
		const { jwt, session } = await configuration();
		const backendSession = {
			userId: 'user-id',
			username: 'sample',
			avatarUrl: null,
			accessToken: result.access_token,
			refreshToken: result.refreshToken,
			accessExpiresAt: now + 3600,
			refreshExpiresAt: now + 7200,
			sessionExpiresAt: now + 10000,
		};
		const stored = { sub: 'user-id', backendSession };
		jest.setSystemTime((now + 3601) * 1000);
		expect(
			await jwt({
				token: stored,
				user: {},
				session: { backendSession: { sessionExpiresAt: now + 999999 } },
			}),
		).toEqual(stored);
		expect(Reflect.apply(session, undefined, [{ token: stored }])).toMatchObject({
			requiresRefresh: true,
		});
		jest.setSystemTime((now + 7200) * 1000);
		expect(await jwt({ token: stored, user: {} })).toBeNull();
		const legacy = {
			sub: 'user-id',
			backendSession: { ...backendSession, sessionExpiresAt: now + 1800 },
		};
		jest.setSystemTime((now + 1800) * 1000);
		expect(await jwt({ token: legacy, user: {} })).toBeNull();
	});
	it.each([60, 0, -1])(
		'refreshes only on update within expiry window: %s seconds',
		async (remaining) => {
			const { provider, jwt, session } = await configuration();
			const user = await provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			);
			const stored = await jwt({ token: {}, user: user! });
			if (!stored) throw new Error('Missing JWT');
			jest.setSystemTime((now + 3600 - remaining) * 1000);
			jest.mocked(refreshAuthCredentials).mockResolvedValue({
				...result,
				access_token: jwtToken(now + 10000),
				refreshToken: jwtToken(now + 20000),
			});
			expect(await jwt({ token: stored, user: {} })).toEqual(stored);
			expect(refreshAuthCredentials).not.toHaveBeenCalled();
			const updated = await jwt({
				token: stored,
				user: {},
				trigger: 'update',
				session: {
					backendSession: {
						userId: 'injected',
						refreshToken: 'injected',
						sessionExpiresAt: now + 999999,
					},
				},
			});
			expect(refreshAuthCredentials).toHaveBeenCalledWith({
				refreshToken: result.refreshToken,
				expectedUserId: result.user.id,
			});
			expect(updated?.backendSession).toMatchObject({
				userId: result.user.id,
				accessToken: jwtToken(now + 10000),
				refreshToken: jwtToken(now + 20000),
				sessionExpiresAt: now + 7200,
			});
			expect(Reflect.apply(session, undefined, [{ token: updated }])).toMatchObject({
				requiresRefresh: false,
			});
		},
	);
	it('does not refresh outside the 60 second window', async () => {
		const { provider, jwt } = await configuration();
		const user = await provider.authorize(
			{ username: 'sample', password: 'synthetic' },
			new Request('https://site.example'),
		);
		const stored = await jwt({ token: {}, user: user! });
		if (!stored) throw new Error('Missing JWT');
		jest.setSystemTime((now + 3539) * 1000);
		expect(await jwt({ token: stored, user: {}, trigger: 'update' })).toEqual(stored);
		expect(refreshAuthCredentials).not.toHaveBeenCalled();
	});
	it.each(['unauthorized', 'identity', 'protocol', 'configuration'] as const)(
		'fails closed on refresh %s without throwing',
		async (code) => {
			const { provider, jwt } = await configuration();
			const user = await provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			);
			const stored = await jwt({ token: {}, user: user! });
			if (!stored) throw new Error('Missing JWT');
			jest.setSystemTime((now + 3600) * 1000);
			jest.mocked(refreshAuthCredentials).mockRejectedValue(new AuthRefreshError(code));
			await expect(jwt({ token: stored, user: {}, trigger: 'update' })).resolves.toBeNull();
		},
	);
	it.each(['network', 'backend', 'capacity'] as const)(
		'retains credentials and deadline on temporary %s',
		async (code) => {
			const { provider, jwt, session } = await configuration();
			const user = await provider.authorize(
				{ username: 'sample', password: 'synthetic' },
				new Request('https://site.example'),
			);
			const stored = await jwt({ token: {}, user: user! });
			if (!stored) throw new Error('Missing JWT');
			jest.setSystemTime((now + 3540) * 1000);
			jest.mocked(refreshAuthCredentials).mockRejectedValue(new AuthRefreshError(code));
			const updated = await jwt({ token: stored, user: {}, trigger: 'update' });
			expect(updated?.backendSession).toEqual({
				...(stored.backendSession as object),
				refreshRetryRequired: true,
			});
			expect(Reflect.apply(session, undefined, [{ token: updated }])).toMatchObject({
				requiresRefresh: true,
			});
			expect(refreshAuthCredentials).toHaveBeenCalledTimes(1);
		},
	);
});
