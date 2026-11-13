/** @jest-environment node */
import { sendVerificationEmail } from './verificationEmail.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = { userId: 'server-user', accessToken: 'synthetic-access' };
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (status: number, message: unknown) =>
	fetchSpy.mockResolvedValue(new Response(JSON.stringify({ message }), { status }));
it('does not send anything merely by importing the module', () => {
	expect(fetchSpy).not.toHaveBeenCalled();
});
it('sends once to the server identity with no-store and returns no credentials', async () => {
	reply(200, 'Verification email was sent');
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'success' });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
	expect(fetchSpy).toHaveBeenCalledWith(
		new URL('https://backend.example/auth/send-verification-email/server-user'),
		expect.objectContaining({
			method: 'GET',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: { Authorization: 'Bearer synthetic-access' },
		}),
	);
});
it.each([
	[401, 'unauthorized', 'unauthenticated'],
	[403, 'auth.user.owner_required', 'forbidden'],
	[403, 'user.user.email.limited_period', 'rate-limited'],
	[429, 'anything', 'rate-limited'],
	[400, 'user.user.already_verified', 'already-verified'],
	[400, 'other', 'error'],
	[500, 'Verification email was sent', 'error'],
	[302, 'Verification email was sent', 'error'],
	[200, 'wrong', 'error'],
	[200, null, 'error'],
])('maps HTTP %s/%s safely', async (status, message, expected) => {
	reply(status, message);
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: expected });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('honors backend rate limiting on a repeated explicit request without retrying', async () => {
	reply(200, 'Verification email was sent');
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'success' });
	reply(403, 'user.user.email.limited_period');
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'rate-limited' });
	expect(fetchSpy).toHaveBeenCalledTimes(2);
});
it('handles network and malformed JSON without success or retries', async () => {
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'error' });
	fetchSpy.mockResolvedValue(new Response('invalid', { status: 200 }));
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'error' });
	expect(fetchSpy).toHaveBeenCalledTimes(2);
});
it('does not confuse malformed forbidden responses with logout', async () => {
	fetchSpy.mockResolvedValue(new Response('invalid', { status: 403 }));
	expect(await sendVerificationEmail(credentials, config)).toEqual({ status: 'forbidden' });
});
it('aborts a hanging request without retrying', async () => {
	jest.useFakeTimers();
	fetchSpy.mockImplementation(() => new Promise(() => {}));
	const result = sendVerificationEmail(credentials, config);
	const signal = fetchSpy.mock.calls[0][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(signal.aborted).toBe(true);
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('rejects invalid config and credentials before sending', async () => {
	expect(await sendVerificationEmail(credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(await sendVerificationEmail({ ...credentials, accessToken: 'bad\r\n' }, config)).toEqual({
		status: 'error',
	});
	expect(await sendVerificationEmail({ ...credentials, userId: '' }, config)).toEqual({
		status: 'error',
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});
