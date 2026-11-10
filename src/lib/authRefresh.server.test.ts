import { BackendAuthError } from '@/entities/auth/server';

import { AuthRefreshError, createAuthRefreshCoordinator } from './authRefresh.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/config/authBackend.server', () => ({ getAuthBackendConfig: jest.fn() }));
jest.mock('@/entities/auth/server', () => {
	class BackendAuthError extends Error {
		constructor(
			public kind: string,
			public status?: number,
		) {
			super('synthetic-private-error');
		}
	}
	return { BackendAuthError, createBackendAuthTransport: jest.fn() };
});
const result = {
	access_token: 'synthetic-access',
	refreshToken: 'synthetic-new-refresh',
	user: { id: 'user-a', username: 'sample', avatarUrl: null },
};
const input = { refreshToken: 'synthetic-old-refresh', expectedUserId: 'user-a' };
const setup = (options = {}) => {
	const refresh = jest.fn().mockResolvedValue(result);
	return { refresh, coordinate: createAuthRefreshCoordinator({ refresh }, options) };
};
beforeEach(() => {
	jest.useFakeTimers();
});
afterEach(() => {
	jest.clearAllTimers();
	jest.useRealTimers();
	jest.restoreAllMocks();
});

describe('server refresh coordinator', () => {
	it('returns verified credentials from one refresh', async () => {
		const { refresh, coordinate } = setup();
		await expect(coordinate(input)).resolves.toEqual(result);
		expect(refresh).toHaveBeenCalledWith(input.refreshToken);
		expect(refresh).toHaveBeenCalledTimes(1);
	});
	it('coalesces pending requests and caches successful rotation', async () => {
		const { refresh, coordinate } = setup();
		let resolve: (value: typeof result) => void;
		refresh.mockReturnValue(
			new Promise<typeof result>((done) => {
				resolve = done;
			}),
		);
		const first = coordinate(input),
			second = coordinate(input);
		await Promise.resolve();
		expect(refresh).toHaveBeenCalledTimes(1);
		resolve!(result);
		expect(await first).toEqual(await second);
		await expect(coordinate(input)).resolves.toEqual(result);
		expect(refresh).toHaveBeenCalledTimes(1);
	});
	it('does not mix different refresh tokens', async () => {
		const { refresh, coordinate } = setup();
		await Promise.all([
			coordinate(input),
			coordinate({ ...input, refreshToken: 'synthetic-other-refresh' }),
		]);
		expect(refresh).toHaveBeenCalledTimes(2);
	});
	it('rejects mismatched identity, including cached and parallel callers', async () => {
		const { refresh, coordinate } = setup();
		await expect(coordinate({ ...input, expectedUserId: 'user-b' })).rejects.toMatchObject({
			code: 'identity',
		});
		const good = coordinate(input);
		const bad = coordinate({ ...input, expectedUserId: 'user-b' });
		await expect(good).resolves.toEqual(result);
		await expect(bad).rejects.toMatchObject({ code: 'identity' });
		await expect(coordinate({ ...input, expectedUserId: 'user-b' })).rejects.toMatchObject({
			code: 'identity',
		});
		expect(refresh).toHaveBeenCalledTimes(2);
	});
	it.each([
		{ error: new BackendAuthError('http', 401), code: 'unauthorized' },
		{ error: new BackendAuthError('network'), code: 'network' },
		{ error: new BackendAuthError('http', 503), code: 'backend' },
		{ error: new Error('synthetic-access synthetic-old-refresh'), code: 'backend' },
	])('sanitizes failures without retries: $code', async ({ error, code }) => {
		const { refresh, coordinate } = setup();
		refresh.mockRejectedValue(error);
		const log = jest.spyOn(console, 'log'),
			err = jest.spyOn(console, 'error');
		let failure: unknown;
		try {
			await coordinate(input);
		} catch (caught) {
			failure = caught;
		}
		expect(failure).toBeInstanceOf(AuthRefreshError);
		expect(failure).toMatchObject({ code });
		expect(`${String(failure)} ${JSON.stringify(failure)}`).not.toMatch(
			/synthetic|refresh_token|cookie/,
		);
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(log).not.toHaveBeenCalled();
		expect(err).not.toHaveBeenCalled();
	});
	it('shares a pending failure and removes it without automatic retry', async () => {
		const { refresh, coordinate } = setup();
		refresh.mockRejectedValueOnce(new BackendAuthError('network'));
		const results = await Promise.allSettled([coordinate(input), coordinate(input)]);
		expect(results.map((value) => value.status)).toEqual(['rejected', 'rejected']);
		expect(refresh).toHaveBeenCalledTimes(1);
		await expect(coordinate(input)).resolves.toEqual(result);
		expect(refresh).toHaveBeenCalledTimes(2);
	});

	it('expires successful entries at TTL', async () => {
		const { refresh, coordinate } = setup({ ttlMs: 100 });
		await coordinate(input);
		jest.advanceTimersByTime(99);
		await coordinate(input);
		expect(refresh).toHaveBeenCalledTimes(1);
		jest.advanceTimersByTime(1);
		await coordinate(input);
		expect(refresh).toHaveBeenCalledTimes(2);
	});
	it('bounds completed entries by evicting the oldest result', async () => {
		const { refresh, coordinate } = setup({ maxEntries: 1 });
		await coordinate(input);
		await coordinate({ ...input, refreshToken: 'synthetic-other-refresh' });
		await coordinate(input);
		expect(refresh).toHaveBeenCalledTimes(3);
		expect(jest.getTimerCount()).toBe(1);
	});
	it('never evicts an in-flight entry to admit another token', async () => {
		const { refresh, coordinate } = setup({ maxEntries: 1 });
		refresh.mockReturnValue(new Promise(() => {}));
		void coordinate(input);
		await expect(
			coordinate({ ...input, refreshToken: 'synthetic-other-refresh' }),
		).rejects.toMatchObject({ code: 'capacity' });
		expect(refresh).toHaveBeenCalledTimes(1);
	});
	it('freezes cached credentials against caller mutation', async () => {
		const { coordinate } = setup();
		const value = await coordinate(input);
		expect(Object.isFrozen(value)).toBe(true);
		expect(Object.isFrozen(value.user)).toBe(true);
	});
});
