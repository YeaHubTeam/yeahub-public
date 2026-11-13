/** @jest-environment node */
import { readSettingsSnapshot } from './settings.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = { userId: 'user-a', accessToken: 'synthetic-access' };
const body = () => ({
	id: 'user-a',
	email: 'test@example.invalid',
	isVerified: true,
	telegramUsername: 'synthetic',
	profiles: [{ id: 'profile-a', specializationId: 1, isActive: true }],
	subscriptions: [{ id: 'sub-a', userId: 'user-a', subscriptionId: 2, state: 'active' }],
	accessToken: 'hidden-access',
	refreshToken: 'hidden-refresh',
	password: 'hidden-password',
});
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (value: unknown, status = 200) =>
	fetchSpy.mockResolvedValue(new Response(JSON.stringify(value), { status }));
it('projects only necessary fields and uses a private no-store request', async () => {
	reply(body());
	expect(await readSettingsSnapshot(credentials, config)).toEqual({
		status: 'success',
		snapshot: {
			userId: 'user-a',
			email: 'test@example.invalid',
			isVerified: true,
			telegramUsername: 'synthetic',
			profiles: body().profiles,
			activeProfileId: 'profile-a',
			subscriptions: [{ id: 'sub-a', subscriptionId: 2, state: 'active' }],
		},
	});
	expect(fetchSpy).toHaveBeenCalledWith(
		new URL('https://backend.example/auth/profile'),
		expect.objectContaining({
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: { Authorization: 'Bearer synthetic-access' },
		}),
	);
});
it.each([null, ''])('preserves missing email value %s', async (email) => {
	reply({ ...body(), email });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: { email },
	});
});
it.each([true, false])('preserves verification %s', async (isVerified) => {
	reply({ ...body(), isVerified });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: { isVerified },
	});
});
it.each([undefined, null, ''])('handles unlinked Telegram %#', async (telegramUsername) => {
	reply({ ...body(), telegramUsername });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: { telegramUsername: null },
	});
});
it('allows no active profile, missing optional isActive, and empty collections', async () => {
	reply({ ...body(), profiles: [{ id: 'p', specializationId: 0 }], subscriptions: [] });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: {
			activeProfileId: null,
			profiles: [{ id: 'p', specializationId: 0, isActive: false }],
			subscriptions: [],
		},
	});
	reply({ ...body(), profiles: [], subscriptions: [] });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: { activeProfileId: null, profiles: [], subscriptions: [] },
	});
});
it.each([401, 403, 500, 302])('distinguishes HTTP %s', async (status) => {
	reply({}, status);
	expect(await readSettingsSnapshot(credentials, config)).toEqual({
		status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error',
	});
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([
	null,
	{},
	{ ...body(), email: undefined },
	{ ...body(), isVerified: 1 },
	{ ...body(), profiles: null },
	{ ...body(), subscriptions: null },
	{ ...body(), telegramUsername: 1 },
	{ ...body(), profiles: [{ id: 'p', specializationId: '1' }] },
	{ ...body(), profiles: [{ id: 'p', specializationId: 1, userId: 'other' }] },
	{
		...body(),
		profiles: [
			{ id: 'p', specializationId: 1, isActive: true },
			{ id: 'q', specializationId: 2, isActive: true },
		],
	},
	{ ...body(), subscriptions: [{ id: 's', subscriptionId: 1, userId: 'other', state: 'active' }] },
	{
		...body(),
		subscriptions: [{ id: 's', subscriptionId: 1, userId: 'user-a', state: 'unknown' }],
	},
])('rejects malformed response %#', async (value) => {
	reply(value);
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
});
it('rejects a non-string subscription state rather than coercing it', async () => {
	reply({
		...body(),
		subscriptions: [{ id: 's', subscriptionId: 1, userId: 'user-a', state: ['active'] }],
	});
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
});
it('isolates identities without a shared cache', async () => {
	reply(body());
	expect(await readSettingsSnapshot({ ...credentials, userId: 'other' }, config)).toEqual({
		status: 'identity-mismatch',
	});
	reply({ ...body(), id: 'other', profiles: [], subscriptions: [] });
	expect(await readSettingsSnapshot({ ...credentials, userId: 'other' }, config)).toMatchObject({
		status: 'success',
		snapshot: { userId: 'other' },
	});
	expect(fetchSpy).toHaveBeenCalledTimes(2);
});
it('handles network failures and invalid JSON', async () => {
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
	fetchSpy.mockResolvedValue(new Response('invalid', { status: 200 }));
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
});
it('bounds a hanging request and aborts it', async () => {
	jest.useFakeTimers();
	fetchSpy.mockImplementation(() => new Promise(() => {}));
	const result = readSettingsSnapshot(credentials, config);
	const signal = fetchSpy.mock.calls[0][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(signal.aborted).toBe(true);
});
it('rejects invalid origin or credentials before fetching', async () => {
	expect(await readSettingsSnapshot(credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(await readSettingsSnapshot({ ...credentials, accessToken: 'bad\r\n' }, config)).toEqual({
		status: 'error',
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});
