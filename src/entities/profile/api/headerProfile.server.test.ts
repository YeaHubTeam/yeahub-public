/** @jest-environment node */
import { readHeaderProfile } from './headerProfile.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = { userId: 'user-a', accessToken: 'synthetic-access' };
const user = () => ({
	id: 'user-a',
	avatarUrl: 'https://images.example/new.png',
	username: 'Name',
	email: 'synthetic@example.invalid',
});
let request: jest.SpyInstance;
beforeEach(() => {
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('synthetic network error'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (body: unknown, status = 200) =>
	request.mockResolvedValue(new Response(JSON.stringify(body), { status }));
it('reads only display fields, without requiring an active profile or unrelated AuthUser fields', async () => {
	reply({ ...user(), profiles: [], accessToken: 'synthetic-hidden', phone: undefined });
	expect(await readHeaderProfile(credentials, config)).toEqual({
		status: 'success',
		profile: {
			userId: 'user-a',
			avatarUrl: user().avatarUrl,
			username: 'Name',
			email: user().email,
		},
	});
	expect(request).toHaveBeenCalledTimes(1);
	expect(request).toHaveBeenCalledWith(
		new URL('https://backend.example/auth/profile'),
		expect.objectContaining({
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
		}),
	);
	const [, options] = request.mock.calls[0];
	expect(options.method).toBe('GET');
	expect([...new Headers(options.headers).entries()]).toEqual([
		['authorization', 'Bearer synthetic-access'],
	]);
	expect(options.body).toBeUndefined();
});
it.each([null, '', 'https://images.example/avatar'])('normalizes avatar %#', async (avatarUrl) => {
	reply({ ...user(), avatarUrl, email: null });
	expect(await readHeaderProfile(credentials, config)).toMatchObject({
		status: 'success',
		profile: { avatarUrl: avatarUrl || null, email: null },
	});
});
it('allows empty email without inventing a value', async () => {
	reply({ ...user(), email: '' });
	expect(await readHeaderProfile(credentials, config)).toMatchObject({
		status: 'success',
		profile: { email: '' },
	});
});
it.each([401, 403, 500, 302])('handles HTTP %s without retry', async (status) => {
	reply({}, status);
	expect(await readHeaderProfile(credentials, config)).toEqual({
		status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
	});
	expect(request).toHaveBeenCalledTimes(1);
});
it('rejects another identity', async () => {
	reply({ ...user(), id: 'other' });
	expect(await readHeaderProfile(credentials, config)).toEqual({ status: 'identity-mismatch' });
});
it.each([
	null,
	{},
	{ ...user(), avatarUrl: undefined },
	{ ...user(), avatarUrl: 'javascript:alert(1)' },
	{ ...user(), avatarUrl: 'https://name:password@example.invalid/img' },
	{ ...user(), username: '' },
	{ ...user(), email: undefined },
	{ ...user(), email: 1 },
])('rejects malformed response %#', async (value) => {
	reply(value);
	expect(await readHeaderProfile(credentials, config)).toEqual({ status: 'error' });
});
it('handles network and JSON failures', async () => {
	expect(await readHeaderProfile(credentials, config)).toEqual({ status: 'error' });
	request.mockResolvedValue(new Response('not-json', { status: 200 }));
	expect(await readHeaderProfile(credentials, config)).toEqual({ status: 'error' });
});
it('aborts a hung request after five seconds', async () => {
	jest.useFakeTimers();
	request.mockImplementation(() => new Promise(() => {}));
	const result = readHeaderProfile(credentials, config);
	const signal = request.mock.calls[0][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
});
it('rejects unapproved origin and invalid credentials before fetch', async () => {
	expect(await readHeaderProfile(credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(await readHeaderProfile({ ...credentials, accessToken: 'bad\r\n' }, config)).toEqual({
		status: 'error',
	});
	expect(request).not.toHaveBeenCalled();
});

it('keeps the deadline while decoding the body and ignores late completion', async () => {
	jest.useFakeTimers();
	let resolve!: (value: unknown) => void;
	const response = new Response('{}');
	const json = jest.spyOn(response, 'json').mockImplementation(
		() =>
			new Promise((done) => {
				resolve = done;
			}),
	);
	request.mockResolvedValue(response);
	const pending = readHeaderProfile(credentials, config);
	await Promise.resolve();
	expect(json).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(1);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error' });
	expect(request.mock.calls[0][1].signal.aborted).toBe(true);
	expect(jest.getTimerCount()).toBe(0);
	resolve(user());
	await Promise.resolve();
	expect(request).toHaveBeenCalledTimes(1);
});
it.each([201, 204, 400, 404, 502, 503])(
	'preserves HTTP %i error without decoding or auth recovery',
	async (status) => {
		const response = new Response(null, { status });
		const json = jest.spyOn(response, 'json');
		request.mockResolvedValue(response);
		expect(await readHeaderProfile(credentials, config)).toEqual({ status: 'error' });
		expect(json).not.toHaveBeenCalled();
		expect(request).toHaveBeenCalledTimes(1);
	},
);
