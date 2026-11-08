import { NextRequest } from 'next/server';

import { configuredTelegramBot, parseTelegramPayload } from '../model/telegram';
import { logout, session as restoreSession } from './handlers';
import { telegramLogin } from './telegram';
import { configuration } from './transport';

const origin = 'https://auth.example.invalid';
const payload = () => ({
	id: 123456,
	first_name: 'Synthetic',
	username: 'synthetic_user',
	auth_date: Math.floor(Date.now() / 1000),
	hash: 'a'.repeat(64),
	photo_url: 'https://t.me/i/userpic/test.jpg',
});
const profile = {
	id: 'telegram-user',
	username: 'synthetic_user',
	email: null,
	userRoles: [{ name: 'candidate-free' }],
	profiles: [{ id: 'telegram-profile', isActive: true, specializationId: 1 }],
	telegramId: 123456,
	passwordHash: 'never-forward',
};
const request = (body: unknown, webOrigin: string | null = origin) =>
	new NextRequest(`${origin}/api/auth/telegram`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(webOrigin ? { Origin: webOrigin } : {}) },
		body: JSON.stringify(body),
	});
let fetchMock: jest.Mock;
beforeEach(() => {
	process.env.AUTH_API_URL = 'http://localhost:4002';
	process.env.AUTH_WEB_ORIGIN = origin;
	process.env.TELEGRAM_BOT_NAME = 'example_test_bot';
	fetchMock = jest.fn();
	global.fetch = fetchMock;
});
const success = () =>
	Response.json(
		{ access_token: 'telegram-access', refresh_token: 'never-forward', user: profile },
		{ status: 201, headers: { 'Set-Cookie': 'refresh_token=telegram-refresh; HttpOnly' } },
	);
it('only verified upstream success establishes AUTH-01 session, supports nullable Telegram email', async () => {
	const data = payload();
	fetchMock.mockResolvedValueOnce(success()).mockResolvedValueOnce(Response.json(profile));
	const result = await telegramLogin(
		request({
			payload: data,
			returnPage: '/ru/questions/react/example?page=2#answer',
			roles: ['admin'],
		}),
	);
	expect(result.status).toBe(200);
	expect(fetchMock.mock.calls[0][0].href).toBe('http://localhost:4002/auth/telegram');
	expect(fetchMock.mock.calls[0][1]).toMatchObject({
		method: 'POST',
		cache: 'no-store',
		redirect: 'error',
	});
	expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(data);
	expect(fetchMock.mock.calls[1][0].pathname).toBe('/auth/profile');
	expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer telegram-access');
	const body = await result.text();
	expect(body).not.toMatch(
		/telegram-access|telegram-refresh|never-forward|telegramId|passwordHash|auth_date/,
	);
	expect(JSON.parse(body)).toMatchObject({
		session: { user: { id: profile.id, email: null }, activeProfile: { id: 'telegram-profile' } },
		returnUrl: '/ru/questions/react/example?page=2#answer',
	});
	expect(result.cookies.get('yh_web_access')).toMatchObject({
		value: 'telegram-access',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	});
	expect(result.cookies.get('yh_web_refresh')).toMatchObject({
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	});
	expect(result.headers.get('cache-control')).toBe('private, no-store');
});
it.each([null, 'https://evil.invalid', 'http://localhost:3000'])(
	'Origin %s blocked before backend',
	async (value) => {
		const response = await telegramLogin(request({ payload: payload() }, value));
		expect(response.status).toBe(403);
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('cross-site, unconfigured and non-JSON requests are blocked', async () => {
	const req = request({ payload: payload() });
	req.headers.set('sec-fetch-site', 'cross-site');
	expect((await telegramLogin(req)).status).toBe(403);
	delete process.env.TELEGRAM_BOT_NAME;
	expect((await telegramLogin(request({ payload: payload() }))).status).toBe(503);
	process.env.TELEGRAM_BOT_NAME = 'example_test_bot';
	const text = request({ payload: payload() });
	text.headers.set('content-type', 'text/plain');
	expect((await telegramLogin(text)).status).toBe(415);
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([null, [], {}, { id: 123 }, { id: 1, auth_date: 1, hash: 'bad', first_name: 'Synthetic' }])(
	'malformed payload never authorizes %s',
	async (value) => {
		expect((await telegramLogin(request({ payload: value }))).status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('expiry/future date are rejected; current signatures still require Nest verification', async () => {
	expect(
		(
			await telegramLogin(
				request({ payload: { ...payload(), auth_date: Math.floor(Date.now() / 1000) - 86401 } }),
			)
		).status,
	).toBe(401);
	expect(
		(
			await telegramLogin(
				request({ payload: { ...payload(), auth_date: Math.floor(Date.now() / 1000) + 61 } }),
			)
		).status,
	).toBe(400);
	expect(fetchMock).not.toHaveBeenCalled();
	fetchMock.mockResolvedValue(
		Response.json(
			{ message: 'auth.telegram.invalid_data', secret: 'never-forward' },
			{ status: 401 },
		),
	);
	const response = await telegramLogin(request({ payload: payload() }));
	expect(await response.json()).toEqual({ error: 'TELEGRAM_INVALID' });
	expect(response.cookies.getAll()).toHaveLength(0);
});
it.each([
	[401, 'auth.telegram.data_outdated', 'TELEGRAM_EXPIRED'],
	[403, 'private', 'TELEGRAM_DENIED'],
	[409, 'private', 'ACCOUNT_CONFLICT'],
	[429, 'private', 'TRY_LATER'],
	[500, 'private', 'AUTH_UNAVAILABLE'],
	[400, 'private', 'TELEGRAM_INVALID'],
])('backend error %s is sanitized', async (status, message, error) => {
	fetchMock.mockResolvedValue(Response.json({ message, payload: payload() }, { status }));
	const response = await telegramLogin(request({ payload: payload() }));
	expect(await response.json()).toEqual({ error });
	expect(response.cookies.getAll()).toHaveLength(0);
});
it('malformed credentials or failed profile do not create a session', async () => {
	fetchMock.mockResolvedValueOnce(Response.json({ user: profile }));
	expect((await telegramLogin(request({ payload: payload() }))).status).toBe(503);
	fetchMock
		.mockResolvedValueOnce(success())
		.mockResolvedValueOnce(Response.json({}, { status: 401 }));
	const result = await telegramLogin(request({ payload: payload() }));
	expect(result.status).toBe(502);
	expect(result.cookies.getAll()).toHaveLength(0);
});
it('network errors never log payload or credentials', async () => {
	const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	const logs = jest.spyOn(console, 'log').mockImplementation(() => undefined);
	const warnings = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
	try {
		fetchMock.mockRejectedValue(new Error('sensitive-payload'));
		const response = await telegramLogin(request({ payload: payload() }));
		expect(await response.json()).toEqual({ error: 'AUTH_UNAVAILABLE' });
		expect(errors).not.toHaveBeenCalled();
		expect(logs).not.toHaveBeenCalled();
		expect(warnings).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	} finally {
		errors.mockRestore();
		logs.mockRestore();
		warnings.mockRestore();
	}
});
it('safe returnPage fallback and bounded body', async () => {
	fetchMock.mockResolvedValueOnce(success()).mockResolvedValueOnce(Response.json(profile));
	const response = await telegramLogin(
		request({ payload: payload(), returnPage: 'https://evil.invalid' }),
	);
	expect((await response.json()).returnUrl).toBe('/ru/auth/login');
	fetchMock.mockClear();
	expect((await telegramLogin(request({ data: 'x'.repeat(8200) }))).status).toBe(413);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('payload parser preserves signed fields, canonical numeric strings; rejects extra fields and unsafe photo', () => {
	const data = payload();
	expect(
		parseTelegramPayload({ ...data, id: String(data.id), auth_date: String(data.auth_date) }),
	).toEqual(data);
	expect(parseTelegramPayload({ ...data, username: undefined, photo_url: undefined })).toEqual({
		id: data.id,
		first_name: data.first_name,
		auth_date: data.auth_date,
		hash: data.hash,
	});
	expect(parseTelegramPayload({ ...data, userId: 'admin' })).toBeNull();
	expect(parseTelegramPayload({ ...data, photo_url: 'javascript:alert(1)' })).toBeNull();
	expect(parseTelegramPayload({ ...data, id: '00123' })).toBeNull();
	expect(parseTelegramPayload({ ...data, id: Number.MAX_SAFE_INTEGER + 1 })).toBeNull();
});
it('public config excludes missing/invalid names, token-like values, localhost/http and URLs with query', () => {
	expect(configuredTelegramBot('example_test_bot', origin)).toBe('example_test_bot');
	for (const bot of [
		undefined,
		'123:never-use-a-token',
		'@example_bot',
		'example_bot();',
		'invalid',
	])
		expect(configuredTelegramBot(bot, origin)).toBeUndefined();
	for (const url of [
		'http://localhost:3000',
		'https://localhost',
		'https://127.0.0.1',
		'http://auth.example.invalid',
		'https://auth.example.invalid/?token=x',
	])
		expect(configuredTelegramBot('example_test_bot', url)).toBeUndefined();
});
it('dev HTTPS origin is allowed only with loopback API; plain nonlocal HTTP remains blocked', () => {
	expect(configuration().web.origin).toBe(origin);
	process.env.AUTH_API_URL = 'https://production.example.invalid';
	expect(() => configuration()).toThrow('AUTH_CONFIGURATION');
	process.env.AUTH_API_URL = 'http://localhost:4002';
	process.env.AUTH_WEB_ORIGIN = 'http://auth.example.invalid';
	expect(() => configuration()).toThrow('AUTH_CONFIGURATION');
});

it('Telegram nullable-email session restores and logs out through the existing handlers', async () => {
	fetchMock.mockResolvedValueOnce(Response.json(profile));
	const restored = await restoreSession(
		new NextRequest(origin + '/api/auth/session', {
			headers: { Cookie: 'yh_web_access=telegram-access' },
		}),
	);
	expect((await restored.json()).session.user.email).toBeNull();
	fetchMock
		.mockResolvedValueOnce(Response.json(profile))
		.mockResolvedValueOnce(new Response(null, { status: 200 }));
	const result = await logout(
		new NextRequest(origin + '/api/auth/logout', {
			method: 'POST',
			headers: {
				Origin: origin,
				Cookie: 'yh_web_access=telegram-access; yh_web_refresh=telegram-refresh',
			},
		}),
	);
	expect(result.status).toBe(200);
	expect(result.cookies.get('yh_web_access')?.maxAge).toBe(0);
	expect(result.cookies.get('yh_web_refresh')?.maxAge).toBe(0);
});
