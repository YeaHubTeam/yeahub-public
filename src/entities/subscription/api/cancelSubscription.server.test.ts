/** @jest-environment node */
import {
	isCancellationSubscriptionId,
	requestSubscriptionCancellation,
} from './cancelSubscription.server';

jest.mock('server-only', () => ({}), { virtual: true });
const userId = '11111111-1111-4111-8111-111111111111';
const credentials = { userId, accessToken: 'synthetic-access' };
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
let request: jest.SpyInstance;
beforeEach(() => {
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const call = () => requestSubscriptionCancellation(2, credentials, config);
it('imports without side effects, performs one DELETE with trusted body, and accepts 200 without reading a body', async () => {
	expect(request).not.toHaveBeenCalled();
	const text = jest.fn();
	const json = jest.fn();
	request.mockResolvedValue({ status: 200, text, json });
	expect(await call()).toEqual({ status: 'success' });
	expect(request).toHaveBeenCalledTimes(1);
	const [url, options] = request.mock.calls[0];
	expect(url).toEqual(new URL('https://backend.example/subscriptions/users'));
	expect(options).toMatchObject({
		method: 'DELETE',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		headers: { Authorization: 'Bearer synthetic-access', 'Content-Type': 'application/json' },
	});
	expect(JSON.parse(options.body)).toEqual({ userId, subscriptionId: 2 });
	expect(text).not.toHaveBeenCalled();
	expect(json).not.toHaveBeenCalled();
});
it.each([
	[400, 'error'],
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[404, 'not-available'],
	[409, 'conflict'],
	[500, 'outcome-unknown'],
	[503, 'outcome-unknown'],
	[204, 'outcome-unknown'],
	[302, 'outcome-unknown'],
] as const)('maps HTTP %s without retry or bank request', async (status, expected) => {
	request.mockResolvedValue(new Response(null, { status }));
	expect(await call()).toEqual({ status: expected });
	expect(request).toHaveBeenCalledTimes(1);
});
it('recognizes only the verified-email cause of forbidden', async () => {
	request.mockResolvedValue(
		new Response(JSON.stringify({ message: 'auth.user.verified', private: 'hidden' }), {
			status: 403,
		}),
	);
	expect(await call()).toEqual({ status: 'verification-required' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('does not retry a lost connection', async () => {
	expect(await call()).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('aborts after five seconds with one DELETE', async () => {
	jest.useFakeTimers();
	request.mockImplementation(() => new Promise(() => {}));
	const result = call();
	const signal = request.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(4999);
	expect(signal.aborted).toBe(false);
	await jest.advanceTimersByTimeAsync(1);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(0);
});
it.each([0, -1, 1.5, NaN, Infinity, '2'])(
	'rejects invalid tariff ID %# before dispatch',
	async (id) => {
		expect(await requestSubscriptionCancellation(id as number, credentials, config)).toEqual({
			status: 'invalid-input',
		});
		expect(request).not.toHaveBeenCalled();
	},
);
it('rejects unsafe origin and credentials before dispatch', async () => {
	expect(
		await requestSubscriptionCancellation(2, credentials, { ...config, allowedOrigins: [] }),
	).toEqual({ status: 'error' });
	expect(
		await requestSubscriptionCancellation(
			2,
			{ ...credentials, accessToken: 'unsafe\nheader' },
			config,
		),
	).toEqual({ status: 'error' });
	expect(request).not.toHaveBeenCalled();
});
it.each([null, 1, '', 'other', '11111111-1111-4111-8111-11111111111Z'])(
	'rejects malformed expected UUID %#',
	(value) => expect(isCancellationSubscriptionId(value)).toBe(false),
);
it('keeps UUID syntax consistent with existing profile operations', () =>
	expect(isCancellationSubscriptionId(userId)).toBe(true));
