/** @jest-environment node */
import * as transport from '@/shared/api/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { registerUser } from './actions';
import type { RegistrationInput } from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/api/index.server', () => {
	const actual = jest.requireActual('@/shared/api/index.server');
	return { ...actual, backendHttp: jest.fn(actual.backendHttp) };
});
jest.mock('@/shared/config/index.server', () => ({ getAuthBackendConfig: jest.fn() }));
jest.mock('@/shared/libs', () => jest.requireActual('@/shared/libs/app/regexp'));
const input: RegistrationInput = {
	username: 'test-user',
	email: 'test@example.invalid',
	password: 'Synthetic1!',
	passwordConfirmation: 'Synthetic1!',
	privacyConsent: true,
	offerConsent: true,
};
const success = {
	access_token: 'synthetic-access',
	user: { id: 'synthetic-id', email: input.email },
};
const response = (status = 201, body: unknown = success) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Set-Cookie': 'refresh_token=synthetic-refresh; HttpOnly' },
	});
let fetchMock: jest.SpyInstance;
let logs: jest.SpyInstance[];
beforeEach(() => {
	jest.useFakeTimers();
	jest.mocked(getAuthBackendConfig).mockReturnValue({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
		allowLocalHttp: false,
	});
	fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(response());
	logs = [
		jest.spyOn(console, 'log').mockImplementation(() => {}),
		jest.spyOn(console, 'error').mockImplementation(() => {}),
		jest.spyOn(console, 'warn').mockImplementation(() => {}),
	];
});
afterEach(() => {
	expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(1);
	for (const log of logs) expect(log).not.toHaveBeenCalled();
	jest.restoreAllMocks();
	jest.clearAllTimers();
	jest.useRealTimers();
});
it('trims username/email and sends exactly three fields without credentials', async () => {
	const value = {
		...input,
		username: ' test-user ',
		email: ' test@example.invalid ',
		adConsent: false,
		isChecked: true,
	};
	expect(await registerUser(value)).toEqual({ status: 'success' });
	const [url, options] = fetchMock.mock.calls[0];
	expect(url.toString()).toBe('https://backend.example/auth/signUp');
	expect(options).toEqual({
		method: 'POST',
		headers: new Headers({ 'Content-Type': 'application/json' }),
		body: JSON.stringify({
			username: input.username,
			email: input.email,
			password: input.password,
		}),
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		signal: expect.any(AbortSignal),
	});
});
it.each([
	{ username: '' },
	{ username: ' a ' },
	{ username: 'a'.repeat(31) },
	{ username: 42 },
	{ email: 'bad' },
	{ email: ' ' },
	{ email: null },
	{ email: 'a b@example.invalid' },
	{ password: 'Aa1!aaa', passwordConfirmation: 'Aa1!aaa' },
	{ password: `Aa1!${'a'.repeat(252)}`, passwordConfirmation: `Aa1!${'a'.repeat(252)}` },
	{ password: 'lowercase1!', passwordConfirmation: 'lowercase1!' },
	{ password: ` ${input.password} `, passwordConfirmation: ` ${input.password} ` },
	{ password: null },
	{ passwordConfirmation: 42 },
	{ passwordConfirmation: 'Different1!' },
	{ privacyConsent: false },
	{ privacyConsent: 'true' },
	{ offerConsent: false },
	{ offerConsent: 1 },
	{ adConsent: 'false' },
])('rejects invalid input case %# without a request', async (patch) => {
	expect(await registerUser({ ...input, ...patch } as RegistrationInput)).toEqual({
		status: 'validation-error',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});
it('rejects a missing input object', async () => {
	// @ts-expect-error Untrusted Server Action input.
	expect(await registerUser(null)).toEqual({ status: 'validation-error' });
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([8, 255])('preserves exact valid password of length %i', async (length) => {
	const password = `Aa1!${'a'.repeat(length - 4)}`;
	expect(await registerUser({ ...input, password, passwordConfirmation: password })).toEqual({
		status: 'success',
	});
	expect(JSON.parse(fetchMock.mock.calls[0][1].body).password).toBe(password);
});
it.each([
	[409, { message: 'user.user.conflict' }, 'conflict'],
	[409, { message: 'unknown' }, 'error'],
	[400, {}, 'validation-error'],
	[401, {}, 'error'],
	[403, {}, 'error'],
	[404, {}, 'error'],
	[429, {}, 'error'],
	[500, {}, 'error'],
	[302, {}, 'error'],
	[307, {}, 'error'],
	[200, success, 'error'],
	[201, {}, 'error'],
	[201, { access_token: '', user: { id: 'id' } }, 'error'],
	[201, { access_token: 'synthetic', user: null }, 'error'],
])('maps HTTP response case %# to a safe status', async (status, body, expected) => {
	fetchMock.mockResolvedValue(response(status, body));
	expect(await registerUser(input)).toEqual({ status: expected });
});
it('rejects malformed successful JSON', async () => {
	fetchMock.mockResolvedValue(new Response('invalid JSON', { status: 201 }));
	expect(await registerUser(input)).toEqual({ status: 'error' });
});
it('hides network details and does not retry', async () => {
	fetchMock.mockRejectedValue(new Error(`${input.email} ${input.password}`));
	expect(await registerUser(input)).toEqual({ status: 'error' });
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('aborts a stalled request after five seconds', async () => {
	fetchMock.mockImplementation(() => new Promise(() => {}));
	const result = registerUser(input);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
});
it('also bounds response parsing by timeout', async () => {
	fetchMock.mockResolvedValue({ status: 201, json: () => new Promise(() => {}) });
	const result = registerUser(input);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
});
it('does not expose response data or forward Set-Cookie', async () => {
	const result = await registerUser(input);
	expect(Object.keys(result)).toEqual(['status']);
	expect(JSON.stringify(result)).toBe('{"status":"success"}');
});
it('fails safely if configuration cannot be read', async () => {
	jest.mocked(getAuthBackendConfig).mockImplementation(() => {
		throw new Error('Private configuration');
	});
	expect(await registerUser(input)).toEqual({ status: 'error' });
	expect(fetchMock).not.toHaveBeenCalled();
});

it('uses one mutation transport call without Authorization or Cookie', async () => {
	expect(await registerUser(input)).toEqual({ status: 'success' });
	expect(transport.backendHttp).toHaveBeenCalledWith(
		expect.objectContaining({
			method: 'POST',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
		}),
	);
	expect([...new Headers(fetchMock.mock.calls[0][1].headers).entries()]).toEqual([
		['content-type', 'application/json'],
	]);
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('preserves HTTP 400 priority without parsing malformed body', async () => {
	const value = new Response('not JSON', { status: 400 });
	const json = jest.spyOn(value, 'json');
	fetchMock.mockResolvedValue(value);
	expect(await registerUser(input)).toEqual({ status: 'validation-error' });
	expect(json).not.toHaveBeenCalled();
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('rejects malformed conflict JSON without exposing backend details', async () => {
	fetchMock.mockResolvedValue(new Response('not JSON', { status: 409 }));
	expect(await registerUser(input)).toEqual({ status: 'error' });
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each([
	null,
	[],
	{ access_token: 'synthetic-access' },
	{ access_token: 'synthetic-access', user: { id: '' } },
])('rejects malformed success envelope %#', async (body) => {
	fetchMock.mockResolvedValue(response(201, body));
	expect(await registerUser(input)).toEqual({ status: 'error' });
});
it('bounds conflict body parsing without retrying account creation', async () => {
	fetchMock.mockResolvedValue({ status: 409, json: () => new Promise(() => {}) });
	const result = registerUser(input);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(0);
});
