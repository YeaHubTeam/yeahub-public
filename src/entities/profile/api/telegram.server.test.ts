/** @jest-environment node */
import { mutateTelegram, parseTelegramPayload } from './telegram.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = { userId: 'server-user', accessToken: 'synthetic-access' };
const payload = () => ({
	id: 123,
	first_name: ' Имя 😀 ',
	last_name: 'Фамилия',
	auth_date: 1800000000,
	hash: 'a'.repeat(64),
	username: 'telegram_user',
	photo_url: 'https://example.invalid/photo?x=1',
});
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (data: unknown, status = 201) =>
	fetchSpy.mockResolvedValue(new Response(JSON.stringify(data), { status }));
const link = () => mutateTelegram({ type: 'link', payload: payload() }, credentials, config);
const unlink = () => mutateTelegram({ type: 'unlink' }, credentials, config);
it('has no import side effects', () => expect(fetchSpy).not.toHaveBeenCalled());
it('links with exactly the signed fields unchanged and returns only safe data', async () => {
	const input = payload();
	reply({
		id: 'server-user',
		telegramUsername: 'telegram_user',
		telegramId: 123,
		accessToken: 'hidden',
		passwordHash: 'hidden',
	});
	expect(await mutateTelegram({ type: 'link', payload: input }, credentials, config)).toEqual({
		status: 'success',
		telegramUsername: 'telegram_user',
	});
	expect(input).toEqual(payload());
	expect(JSON.parse(fetchSpy.mock.calls[0][1].body as string)).toEqual(input);
	expect(fetchSpy).toHaveBeenCalledTimes(1);
	expect(fetchSpy).toHaveBeenCalledWith(
		new URL('https://backend.example/users/link-telegram'),
		expect.objectContaining({
			method: 'POST',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: { Authorization: 'Bearer synthetic-access', 'Content-Type': 'application/json' },
			body: expect.any(String),
		}),
	);
});
it('unlinks without identity or payload in the body', async () => {
	reply({ id: 'server-user', telegramUsername: null });
	expect(await unlink()).toEqual({ status: 'success', telegramUsername: null });
	expect(fetchSpy).toHaveBeenCalledWith(
		new URL('https://backend.example/users/unlink-telegram'),
		expect.objectContaining({
			method: 'POST',
			cache: 'no-store',
			headers: { Authorization: 'Bearer synthetic-access' },
		}),
	);
	expect(fetchSpy.mock.calls[0][1]).not.toHaveProperty('body');
});
it('allows absent username without inventing an unlinked flag', async () => {
	const { username, ...input } = payload();
	void username;
	reply({ id: 'server-user' });
	expect(await mutateTelegram({ type: 'link', payload: input }, credentials, config)).toEqual({
		status: 'success',
		telegramUsername: null,
	});
});
it.each([
	null,
	[],
	{},
	{ ...payload(), userId: 'other' },
	{ ...payload(), accessToken: 'forged' },
	{ ...payload(), extra: 'field' },
	{ ...payload(), id: '123' },
	{ ...payload(), id: 0 },
	{ ...payload(), id: Number.MAX_SAFE_INTEGER + 1 },
	{ ...payload(), auth_date: '1800000000' },
	{ ...payload(), hash: 'wrong' },
	{ ...payload(), first_name: '' },
	{ ...payload(), first_name: '😀'.repeat(257) },
	{ ...payload(), username: null },
	{ ...payload(), last_name: [] },
	{ ...payload(), photo_url: 'javascript:alert(1)' },
	{ ...payload(), photo_url: 'https://name:pass@example.invalid' },
	{ ...payload(), photo_url: 'https://example.invalid/' + 'a'.repeat(4096) },
	{ ...payload(), username: 'a'.repeat(257) },
])('rejects invalid payload %# before any backend request', async (input) => {
	expect(parseTelegramPayload(input)).toBeNull();
	expect(await mutateTelegram({ type: 'link', payload: input }, credentials, config)).toEqual({
		status: 'validation-error',
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});
it('rejects oversized JSON caused by escaped signed characters', () => {
	expect(
		parseTelegramPayload({
			...payload(),
			first_name: '\u0000'.repeat(1024),
			last_name: '\u0000'.repeat(1024),
		}),
	).toBeNull();
});
it.each([
	[401, 'auth.telegram.invalid_data', 'invalid-telegram-data'],
	[401, 'auth.telegram.data_outdated', 'outdated-telegram-data'],
	[401, 'auth.auth.unauthorized', 'unauthenticated'],
	[401, 'unknown', 'error'],
	[403, 'auth.telegram.verify_denied', 'invalid-telegram-data'],
	[403, 'user.telegram.already_linked', 'already-linked'],
	[403, 'user.telegram.linked_to_another_user', 'linked-to-another-user'],
	[403, 'user.telegram.not_linked', 'not-linked'],
	[403, 'user.user.has_no_another_way_to_login', 'unlink-forbidden'],
	[403, 'unknown', 'forbidden'],
	[404, 'user.user.id.not_found', 'not-found'],
	[400, 'invalid', 'error'],
	[500, 'unknown', 'error'],
	[429, 'unknown', 'error'],
] as const)('maps HTTP %s / %s without retry', async (status, message, expected) => {
	reply({ message }, status);
	expect(await link()).toEqual({ status: expected });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([
	null,
	{},
	{ id: 'server-user', telegramUsername: 123 },
	{ id: 'server-user', telegramUsername: 'unexpected' },
])('rejects malformed 201 %#', async (data) => {
	reply(data);
	expect(await link()).toEqual({ status: 'error' });
});
it('rejects another identity and non-201 success', async () => {
	reply({ id: 'other', telegramUsername: 'telegram_user' });
	expect(await link()).toEqual({ status: 'identity-mismatch' });
	reply({ id: 'server-user', telegramUsername: 'telegram_user' }, 200);
	expect(await link()).toEqual({ status: 'error' });
});
it.each([undefined, 'telegram_user', ''])(
	'requires explicit cleared username for unlink %#',
	async (telegramUsername) => {
		reply({ id: 'server-user', telegramUsername });
		expect(await unlink()).toEqual({ status: 'error' });
	},
);
it('handles network and JSON errors without repeating the POST', async () => {
	expect(await link()).toEqual({ status: 'error' });
	fetchSpy.mockResolvedValue(new Response('invalid', { status: 201 }));
	expect(await unlink()).toEqual({ status: 'error' });
	expect(fetchSpy).toHaveBeenCalledTimes(2);
});
it('aborts a hanging request after five seconds without retry', async () => {
	jest.useFakeTimers();
	fetchSpy.mockImplementation(() => new Promise(() => {}));
	const result = link();
	const signal = fetchSpy.mock.calls[0][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(signal.aborted).toBe(true);
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('rejects invalid origin and credentials before HTTP', async () => {
	expect(
		await mutateTelegram({ type: 'unlink' }, credentials, { ...config, allowedOrigins: [] }),
	).toEqual({ status: 'error' });
	expect(
		await mutateTelegram({ type: 'unlink' }, { ...credentials, accessToken: 'bad\r\n' }, config),
	).toEqual({ status: 'error' });
	expect(fetchSpy).not.toHaveBeenCalled();
});
