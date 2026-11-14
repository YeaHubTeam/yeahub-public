/** @jest-environment node */
import { requestTrial } from './trial.server';

jest.mock('server-only', () => ({}), { virtual: true });
const credentials = { accessToken: 'synthetic-access' };
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
const call = () => requestTrial(credentials, config);
it('has no import effects and sends exactly one explicit mutation GET with no body or query', async () => {
	expect(request).not.toHaveBeenCalled();
	request.mockResolvedValue(new Response(null, { status: 200 }));
	expect(await call()).toEqual({ status: 'success' });
	expect(request).toHaveBeenCalledTimes(1);
	const [url, options] = request.mock.calls[0];
	expect(url).toEqual(new URL('https://backend.example/subscriptions/trial'));
	expect(options).toMatchObject({
		method: 'GET',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		headers: { Authorization: 'Bearer synthetic-access' },
	});
	expect(options.body).toBeUndefined();
});
it.each([
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[404, 'error'],
	[409, 'conflict'],
	[500, 'outcome-unknown'],
	[503, 'outcome-unknown'],
	[302, 'outcome-unknown'],
	[204, 'outcome-unknown'],
] as const)('maps HTTP %s to %s without retry', async (status, expected) => {
	request.mockResolvedValue(new Response(null, { status }));
	expect(await call()).toEqual({ status: expected });
	expect(request).toHaveBeenCalledTimes(1);
});
it('recognizes only the verified-email backend error without exposing its payload', async () => {
	request.mockResolvedValue(
		new Response(JSON.stringify({ message: 'auth.user.verified', private: 'secret' }), {
			status: 403,
		}),
	);
	expect(await call()).toEqual({ status: 'verification-required' });
});
it('treats a network failure after dispatch as unknown without retry', async () => {
	expect(await call()).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('aborts at five seconds and never replays the mutation', async () => {
	jest.useFakeTimers();
	request.mockImplementation(() => new Promise(() => {}));
	const result = call();
	const signal = request.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
});
it('rejects untrusted config and unsafe credentials before dispatch', async () => {
	expect(await requestTrial(credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(await requestTrial({ accessToken: 'unsafe\nheader' }, config)).toEqual({
		status: 'error',
	});
	expect(request).not.toHaveBeenCalled();
});
