/** @jest-environment node */
import * as transport from '@/shared/api/index.server';

import { deleteOwnAccount } from './accountDeletion.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/api/index.server', () => {
	const actual = jest.requireActual('@/shared/api/index.server');
	return { ...actual, backendHttp: jest.fn(actual.backendHttp) };
});
const userId = '11111111-1111-4111-8111-111111111111';
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = {
	userId,
	accessToken: 'synthetic-access',
	accessExpiresAt: 2000000000,
	sessionDeadline: 2000000100,
};
const snapshot = () => ({
	id: userId,
	username: ' Name ',
	email: null,
	isVerified: false,
	profiles: [],
	subscriptions: [],
	userRoles: [],
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
let request: jest.SpyInstance;
beforeEach(() => {
	jest.useFakeTimers().setSystemTime(1800000000000);
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private network failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const remove = (confirmation: unknown = ' Name ') =>
	deleteOwnAccount(confirmation, credentials, config);
const prepare = (
	before: unknown = snapshot(),
	result: unknown = { message: 'User deleted successfully' },
	status = 200,
) => request.mockResolvedValueOnce(json(before)).mockResolvedValueOnce(json(result, status));
it('has no import side effects', () => {
	expect(request).not.toHaveBeenCalled();
});
it('uses trusted identity, no-store and one DELETE without a body or a post-delete readback', async () => {
	prepare();
	expect(await remove()).toEqual({ status: 'success' });
	expect(request).toHaveBeenCalledTimes(2);
	expect(request.mock.calls.map(([url]) => url.pathname)).toEqual([
		'/auth/profile',
		`/users/${userId}`,
	]);
	expect(request.mock.calls[1][1]).toMatchObject({
		method: 'DELETE',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		headers: new Headers({ Authorization: 'Bearer synthetic-access' }),
	});
	expect(request.mock.calls[1][1].body).toBeUndefined();
	expect([...new Headers(request.mock.calls[1][1].headers).entries()]).toEqual([
		['authorization', 'Bearer synthetic-access'],
	]);
	expect(new Headers(request.mock.calls[1][1].headers).has('Cookie')).toBe(false);
});
it.each([null, undefined, '', 1, {}, [], { userId, confirmationUsername: ' Name ' }])(
	'rejects invalid confirmation %# without requests',
	async (value) => {
		expect(await deleteOwnAccount(value, credentials, config)).toEqual({ status: 'invalid-input' });
		expect(request).not.toHaveBeenCalled();
	},
);
it.each(['Name', ' name ', ' Name', 'Name ', ' NAME '])(
	'compares confirmation exactly: %j',
	async (value) => {
		request.mockResolvedValueOnce(json(snapshot()));
		expect(await remove(value)).toEqual({ status: 'confirmation-mismatch' });
		expect(request).toHaveBeenCalledTimes(1);
	},
);
it.each([null, undefined, '', 123])(
	'does not delete without a usable server username %#',
	async (username) => {
		request.mockResolvedValueOnce(json({ ...snapshot(), username }));
		expect(await remove()).toEqual({ status: 'confirmation-mismatch' });
		expect(request).toHaveBeenCalledTimes(1);
	},
);
it('does not normalize Unicode', async () => {
	request.mockResolvedValueOnce(json({ ...snapshot(), username: 'é' }));
	expect(await remove('e\u0301')).toEqual({ status: 'confirmation-mismatch' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('checks fresh snapshot identity', async () => {
	request.mockResolvedValueOnce(json({ ...snapshot(), id: 'another-user' }));
	expect(await remove()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(1);
});
it.each(['invalid', '', '../users/other'])(
	'rejects malformed trusted identity %j before requests',
	async (userId) => {
		expect(await deleteOwnAccount(' Name ', { ...credentials, userId }, config)).toEqual({
			status: 'error',
		});
		expect(request).not.toHaveBeenCalled();
	},
);
it.each([
	['accessExpiresAt', 'refresh-required'],
	['sessionDeadline', 'unauthenticated'],
] as const)('rejects expired %s', async (field, status) => {
	expect(await deleteOwnAccount(' Name ', { ...credentials, [field]: 1799999999 }, config)).toEqual(
		{ status },
	);
	expect(request).not.toHaveBeenCalled();
});
it.each([
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[500, 'error'],
])('does not DELETE after snapshot HTTP %s', async (status, result) => {
	request.mockResolvedValueOnce(json({}, status));
	expect(await remove()).toEqual({ status: result });
	expect(request).toHaveBeenCalledTimes(1);
});
it('does not require verified email, an active profile or absence of an active paid subscription', async () => {
	const before = {
		...snapshot(),
		subscriptions: [
			{
				id: 'subscription',
				userId,
				subscriptionId: 6,
				state: 'active',
				createDate: '2026-01-01T00:00:00.000Z',
			},
		],
	};
	prepare(before);
	expect(await remove()).toEqual({ status: 'success' });
	expect(request).toHaveBeenCalledTimes(2);
	expect(request.mock.calls.map(([url]) => url.pathname)).toEqual([
		'/auth/profile',
		`/users/${userId}`,
	]);
});
it.each([null, {}, [], { message: 'unexpected' }, { message: 123 }])(
	'does not accept an unexpected HTTP 200 body %#',
	async (result) => {
		prepare(snapshot(), result);
		expect(await remove()).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
	},
);
it('treats malformed success JSON as unknown', async () => {
	request
		.mockResolvedValueOnce(json(snapshot()))
		.mockResolvedValueOnce(new Response('{broken', { status: 200 }));
	expect(await remove()).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(2);
});
it.each([
	[400, { message: 'storage.s3.url_invalid' }, 'outcome-unknown'],
	[400, { message: 'Validation failed (uuid is expected)' }, 'invalid-input'],
	[400, { message: 'user.user.already_deleted' }, 'error'],
	[401, {}, 'unauthenticated'],
	[403, {}, 'forbidden'],
	[404, { message: 'storage.s3.not_found' }, 'outcome-unknown'],
	[500, {}, 'outcome-unknown'],
	[409, {}, 'outcome-unknown'],
	[429, {}, 'outcome-unknown'],
	[302, {}, 'outcome-unknown'],
	[204, {}, 'outcome-unknown'],
])('handles mutation HTTP %s without exposing the body (%#)', async (status, body, result) => {
	request
		.mockResolvedValueOnce(json(snapshot()))
		.mockResolvedValueOnce(
			status === 204 ? new Response(null, { status: 204 }) : json(body, status),
		);
	expect(await remove()).toEqual({ status: result });
	expect(request).toHaveBeenCalledTimes(2);
});
it('times out after five seconds, aborts and never retries', async () => {
	request
		.mockResolvedValueOnce(json(snapshot()))
		.mockImplementationOnce(() => new Promise(() => {}));
	const pending = remove();
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(2);
	expect(request.mock.calls[1][1].signal.aborted).toBe(true);
});
it('covers response body timeout as well as response headers', async () => {
	const result = json({});
	jest.spyOn(result, 'json').mockImplementation(() => new Promise(() => {}));
	request.mockResolvedValueOnce(json(snapshot())).mockResolvedValueOnce(result);
	const pending = remove();
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(2);
});
it('does not retry network failure after sending DELETE', async () => {
	request.mockResolvedValueOnce(json(snapshot()));
	expect(await remove()).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(2);
});
it('rechecks credentials after loading the snapshot', async () => {
	request.mockImplementationOnce(() => {
		jest.setSystemTime(2000000000000);
		return Promise.resolve(json(snapshot()));
	});
	expect(await remove()).toEqual({ status: 'refresh-required' });
	expect(request).toHaveBeenCalledTimes(1);
});

it('returns only a safe status even when the backend response contains private extra fields', async () => {
	prepare(snapshot(), {
		message: 'User deleted successfully',
		accessToken: 'private-synthetic-access',
		refreshToken: 'private-synthetic-refresh',
		username: 'private-name',
	});
	expect(await remove()).toEqual({ status: 'success' });
	expect(request).toHaveBeenCalledTimes(2);
});

it('marks the single DELETE as a mutation with the existing deadline', async () => {
	prepare();
	expect(await remove()).toEqual({ status: 'success' });
	expect(transport.backendHttp).toHaveBeenCalledWith(
		expect.objectContaining({
			path: `/users/${userId}`,
			method: 'DELETE',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
		}),
	);
	expect(request).toHaveBeenCalledTimes(2);
});
it.each([400, 404, 409, 429, 500])(
	'keeps malformed HTTP %s responses unknown without replay',
	async (status) => {
		request
			.mockResolvedValueOnce(json(snapshot()))
			.mockResolvedValueOnce(new Response('invalid', { status }));
		expect(await remove()).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
	},
);
it.each([
	[401, 'unauthenticated'],
	[403, 'forbidden'],
] as const)('keeps HTTP %s priority without decoding its body', async (status, expected) => {
	const value = new Response('invalid', { status });
	const parse = jest.spyOn(value, 'json');
	request.mockResolvedValueOnce(json(snapshot())).mockResolvedValueOnce(value);
	expect(await remove()).toEqual({ status: expected });
	expect(parse).not.toHaveBeenCalled();
	expect(request).toHaveBeenCalledTimes(2);
});
