/** @jest-environment node */
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';

import { sendPasswordResetEmail } from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/config/authBackend.server', () => ({ getAuthBackendConfig: jest.fn() }));
// Use the actual public API email rule without loading unrelated UI/browser helpers.
jest.mock('@/shared/libs', () => ({
	emailRule: jest.requireActual('@/shared/libs/app/regexp').emailRule,
}));

const email = 'test+tag%name@example.invalid';
let fetchMock: jest.SpyInstance;
beforeEach(() => {
	jest.useFakeTimers();
	jest.mocked(getAuthBackendConfig).mockReturnValue({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
		allowLocalHttp: false,
	});
	fetchMock = jest
		.spyOn(globalThis, 'fetch')
		.mockResolvedValue(new Response(null, { status: 200 }));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllTimers();
	jest.useRealTimers();
});

it('trims and encodes email, accepts HTTP 200 without requiring a body', async () => {
	expect(await sendPasswordResetEmail(`  ${email}  `)).toEqual({ status: 'success' });
	const [url, options] = fetchMock.mock.calls[0];
	expect(url.origin).toBe('https://backend.example');
	expect(url.pathname).toBe('/auth/send-reset-password');
	expect(url.searchParams.get('email')).toBe(email);
	expect(url.search).toContain('%2B');
	expect(url.search).toContain('%25');
	expect(options).toEqual({
		method: 'GET',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		signal: expect.any(AbortSignal),
	});
	expect(options.headers).toBeUndefined();
	expect(options.body).toBeUndefined();
});
it.each(['', '   ', 'invalid', 'a b@example.invalid', `${'a'.repeat(250)}@example.invalid`])(
	'rejects invalid input without a request: case %#',
	async (value) => {
		expect(await sendPasswordResetEmail(value)).toEqual({ status: 'validation-error' });
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('checks runtime input types', async () => {
	// @ts-expect-error Untrusted Server Action arguments need runtime validation.
	expect(await sendPasswordResetEmail(null)).toEqual({ status: 'validation-error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([201, 204, 302, 307, 400, 401, 404, 429, 500])(
	'hides backend status %i and body',
	async (status) => {
		fetchMock.mockResolvedValue(
			new Response(status === 204 ? null : `Internal details ${email}`, { status }),
		);
		expect(await sendPasswordResetEmail(email)).toEqual({ status: 'error' });
	},
);
it('hides network errors', async () => {
	fetchMock.mockRejectedValue(new Error(`Internal details ${email}`));
	expect(await sendPasswordResetEmail(email)).toEqual({ status: 'error' });
});
it('aborts and returns a safe timeout even if fetch does not settle', async () => {
	fetchMock.mockImplementation(() => new Promise(() => {}));
	const result = sendPasswordResetEmail(email);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
});
it('hides configuration errors', async () => {
	jest.mocked(getAuthBackendConfig).mockImplementation(() => {
		throw new Error(`Internal ${email}`);
	});
	expect(await sendPasswordResetEmail(email)).toEqual({ status: 'error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it('rejects an origin outside the allowlist', async () => {
	jest.mocked(getAuthBackendConfig).mockReturnValue({
		apiOrigin: 'https://backend.example',
		allowedOrigins: [],
		allowLocalHttp: false,
	});
	expect(await sendPasswordResetEmail(email)).toEqual({ status: 'error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
