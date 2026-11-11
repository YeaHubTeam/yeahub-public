/** @jest-environment node */
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';

import { resetPassword } from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/config/authBackend.server', () => ({ getAuthBackendConfig: jest.fn() }));
jest.mock('@/shared/libs', () => ({
	passwordRules: jest.requireActual('@/shared/libs/app/regexp').passwordRules,
}));
const token = 'a'.repeat(40);
const password = 'Synthetic1!';
let fetchMock: jest.SpyInstance;
const response = (
	status = 200,
	body: unknown = { access_token: 'synthetic-access', user: { id: 'synthetic-user' } },
) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Set-Cookie': 'refresh_token=synthetic-refresh; HttpOnly' },
	});
beforeEach(() => {
	jest.useFakeTimers();
	jest.mocked(getAuthBackendConfig).mockReturnValue({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
		allowLocalHttp: false,
	});
	fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(response());
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllTimers();
	jest.useRealTimers();
});
it('sends exact PATCH body without credentials and returns only success', async () => {
	expect(await resetPassword(token, password, password)).toEqual({ status: 'success' });
	const [url, options] = fetchMock.mock.calls[0];
	expect(url.toString()).toBe('https://backend.example/auth/reset-password');
	expect(options).toEqual({
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ password, passwordConfirm: password, token }),
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		signal: expect.any(AbortSignal),
	});
});
it.each(['', ' ', 'bad', 'g'.repeat(40), 'a'.repeat(39), ` ${token}`])(
	'rejects token case %# without requesting backend',
	async (value) => {
		expect(await resetPassword(value, password, password)).toEqual({ status: 'invalid-token' });
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('checks runtime argument types', async () => {
	// @ts-expect-error Untrusted runtime arguments.
	expect(await resetPassword(null, password, password)).toEqual({ status: 'invalid-token' });
	// @ts-expect-error Untrusted runtime arguments.
	expect(await resetPassword(token, 42, password)).toEqual({ status: 'validation-error' });
	// @ts-expect-error Untrusted runtime arguments.
	expect(await resetPassword(token, password, null)).toEqual({ status: 'validation-error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([
	'Aa1!aaa',
	`Aa1!${'a'.repeat(252)}`,
	'abcdefgh',
	'lowercase1!',
	'UPPERCASE1!',
	'NoDigits!!',
	'NoSymbols1',
	` ${password} `,
])('rejects invalid passwords without trimming: case %#', async (value) => {
	expect(await resetPassword(token, value, value)).toEqual({ status: 'validation-error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([8, 255])('accepts boundary password length %i', async (length) => {
	const value = `Aa1!${'a'.repeat(length - 4)}`;
	expect(await resetPassword(token, value, value)).toEqual({ status: 'success' });
});
it('rejects mismatched confirmation', async () => {
	expect(await resetPassword(token, password, `${password}x`)).toEqual({
		status: 'validation-error',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([
	[401, { message: 'auth.user.reset_password_token.verification_failed' }, 'invalid-token'],
	[401, { message: 'auth.auth.public_unauthorized' }, 'error'],
	[400, { statusCode: 400, message: ['invalid password'] }, 'validation-error'],
	[400, { message: 'unknown' }, 'error'],
	[500, {}, 'error'],
	[302, {}, 'error'],
	[307, {}, 'error'],
	[201, {}, 'error'],
	[200, {}, 'error'],
	[200, { access_token: '', user: { id: 'id' } }, 'error'],
])('maps response case %# safely', async (status, body, expected) => {
	fetchMock.mockResolvedValue(response(status, body));
	expect(await resetPassword(token, password, password)).toEqual({ status: expected });
});
it('rejects malformed JSON on HTTP 200', async () => {
	fetchMock.mockResolvedValue(new Response('not JSON', { status: 200 }));
	expect(await resetPassword(token, password, password)).toEqual({ status: 'error' });
});
it('hides network exception details', async () => {
	fetchMock.mockRejectedValue(new Error(`${token} ${password}`));
	expect(await resetPassword(token, password, password)).toEqual({ status: 'error' });
});
it('aborts timeout without exposing credentials', async () => {
	fetchMock.mockImplementation(() => new Promise(() => {}));
	const result = resetPassword(token, password, password);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
});
it('times out while response JSON is stalled too', async () => {
	fetchMock.mockResolvedValue({ status: 200, json: () => new Promise(() => {}) });
	const result = resetPassword(token, password, password);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
});
it('hides configuration errors', async () => {
	jest.mocked(getAuthBackendConfig).mockImplementation(() => {
		throw new Error(token);
	});
	expect(await resetPassword(token, password, password)).toEqual({ status: 'error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
