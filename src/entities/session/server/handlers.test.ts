import { NextRequest } from 'next/server';

import { safeReturnUrl } from '../model/session';
import { login, logout, refresh, session } from './handlers';
import { publicSession } from './transport';

const web = 'http://localhost:3000';
const profile = (id = 'user-a') => ({
	id,
	username: id,
	email: `${id}@local.invalid`,
	isVerified: true,
	userRoles: [{ name: 'candidate', permissions: [] }],
	profiles: [{ id: `${id}-profile`, specializationId: 1, isActive: true }],
	access_token: 'must-not-leak',
	refreshToken: 'must-not-leak',
	passwordHash: 'must-not-leak',
});
const request = (action: string, cookie = '', body?: unknown, origin: string | null = web) =>
	new NextRequest(`${web}/api/auth/${action}`, {
		method: action === 'session' ? 'GET' : 'POST',
		headers: {
			...(origin ? { Origin: origin } : {}),
			Cookie: cookie,
			'Content-Type': 'application/json',
		},
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
const credentials = (suffix: string) =>
	Response.json(
		{ access_token: `access-${suffix}`, user: profile() },
		{
			headers: { 'Set-Cookie': `refresh_token=refresh-${suffix}; HttpOnly; Secure; SameSite=None` },
		},
	);
let fetchMock: jest.Mock;
let count = 0;
beforeEach(() => {
	delete process.env.API_URL;
	delete process.env.LANDING_URL;
	delete process.env.NEXT_PUBLIC_API_URL;
	delete process.env.NEXT_PUBLIC_SITE_URL;
	process.env.AUTH_API_URL = 'http://127.0.0.1:4002/';
	process.env.AUTH_WEB_ORIGIN = web;
	fetchMock = jest.fn();
	global.fetch = fetchMock;
	count++;
});
afterEach(() => {
	jest.restoreAllMocks();
});

it.each([
	'https://evil.invalid',
	'//evil.invalid',
	'/ru/\\evil',
	'/ru/%5cevil',
	'/ru/auth/login',
	'/ru/../admin',
	'/ru/%0aevil',
	'/ru/%61uth/login',
])('отклоняет returnPage %s', (target) => {
	expect(safeReturnUrl(target)).toBe('/ru/auth/login');
});
it('сохраняет безопасные query и hash', () => {
	expect(safeReturnUrl('/ru/questions/react?q=1#answer')).toBe('/ru/questions/react?q=1#answer');
});
it.each(['https://evil.invalid', null])('Origin проверяется до upstream: %s', async (origin) => {
	for (const handler of [login, logout, refresh])
		expect((await handler(request('login', '', {}, origin))).status).toBe(403);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('login: whitelist DTO, host-only cookies, no-store и безопасный return URL', async () => {
	fetchMock
		.mockResolvedValueOnce(credentials('login'))
		.mockResolvedValueOnce(Response.json(profile()));
	const result = await login(
		request('login', '', {
			username: 'a@local.invalid',
			password: 'test-only',
			returnPage: '/ru/questions/react?page=2',
		}),
	);
	expect(result.status).toBe(200);
	const cookies = result.headers.getSetCookie().join(';');
	expect(cookies).toContain('yh_web_access=access-login');
	expect(cookies).toContain('yh_web_refresh=refresh-login');
	expect(cookies).toContain('HttpOnly');
	expect(cookies).toContain('SameSite=lax');
	expect(cookies).toContain('Path=/');
	expect(cookies).not.toContain('Domain=');
	expect(result.headers.get('cache-control')).toBe('private, no-store');
	const body = await result.text();
	expect(body).not.toMatch(/access-login|refresh-login|must-not-leak|passwordHash/);
	expect(body).toContain('user-a-profile');
	expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store', redirect: 'error' });
});
it('Secure включается на настроенном HTTPS origin', async () => {
	process.env.AUTH_WEB_ORIGIN = 'https://localhost:3000';
	fetchMock
		.mockResolvedValueOnce(credentials('secure'))
		.mockResolvedValueOnce(Response.json(profile()));
	const response = await login(
		request('login', '', { username: 'a', password: 'b' }, 'https://localhost:3000'),
	);
	expect(response.headers.getSetCookie().every((cookie) => cookie.includes('Secure'))).toBe(true);
});
it('неверный пароль не выдаёт cookie/детали backend', async () => {
	fetchMock.mockResolvedValue(Response.json({ passwordHash: 'secret' }, { status: 401 }));
	const response = await login(request('login', '', { username: 'a', password: 'b' }));
	expect(response.status).toBe(401);
	expect(response.headers.getSetCookie()).toHaveLength(0);
	expect(await response.text()).not.toContain('secret');
});
it('guest session не обращается в backend', async () => {
	expect((await session(request('session'))).status).toBe(401);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('изолирует user A и B по credentials каждого запроса', async () => {
	fetchMock.mockImplementation((_url: string, options: RequestInit) =>
		Promise.resolve(
			Response.json(
				profile(
					(options.headers as Record<string, string>).Authorization.endsWith('a') ? 'a' : 'b',
				),
			),
		),
	);
	const [a, b] = await Promise.all([
		session(request('session', 'yh_web_access=a')),
		session(request('session', 'yh_web_access=b')),
	]);
	expect((await a.json()).session.user.id).toBe('a');
	expect((await b.json()).session.user.id).toBe('b');
});
it('два параллельных refresh со старой cookie выполняют одну ротацию', async () => {
	const suffix = `concurrent-${count}`;
	fetchMock.mockImplementation((url: URL) =>
		Promise.resolve(
			url.pathname.endsWith('/refresh') ? credentials(suffix) : Response.json(profile()),
		),
	);
	const cookie = `yh_web_refresh=old-${suffix}`;
	const [a, b] = await Promise.all([
		refresh(request('refresh', cookie)),
		refresh(request('refresh', cookie)),
	]);
	expect(a.status).toBe(200);
	expect(b.status).toBe(200);
	expect(a.headers.getSetCookie()).toEqual(b.headers.getSetCookie());
	expect(
		fetchMock.mock.calls.filter(([url]: [URL]) => url.pathname.endsWith('/refresh')),
	).toHaveLength(1);
	expect(await a.text()).not.toContain(`access-${suffix}`);
});
it('refresh failure очищает обе cookies без retry loop', async () => {
	fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
	const response = await refresh(request('refresh', `yh_web_refresh=bad-${count}`));
	expect(response.status).toBe(401);
	expect(response.headers.getSetCookie()).toHaveLength(2);
	expect(response.headers.getSetCookie().every((cookie) => cookie.includes('Max-Age=0'))).toBe(
		true,
	);
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('logout очищает cookies даже при upstream failure', async () => {
	fetchMock.mockRejectedValue(new Error('do-not-expose'));
	const response = await logout(request('logout', 'yh_web_access=old'));
	expect(response.status).toBe(502);
	expect(response.headers.getSetCookie()).toHaveLength(2);
	expect(await response.text()).not.toContain('do-not-expose');
});
it('logout отзывает backend сессию', async () => {
	fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
	const response = await logout(request('logout', 'yh_web_access=valid'));
	expect(response.status).toBe(200);
	expect(fetchMock.mock.calls[0][0].pathname).toBe('/auth/logout');
});
it('без явного локального API origin запрос не уходит во внешний fallback', async () => {
	delete process.env.AUTH_API_URL;
	expect((await login(request('login', '', { username: 'a', password: 'b' }))).status).toBe(503);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('новые upstream поля не расширяют public DTO', () => {
	expect(JSON.stringify(publicSession(profile()))).not.toMatch(/must-not-leak|passwordHash/);
});

it('returnPage сохраняет пробелы в query фильтра', () => {
	expect(safeReturnUrl('/ru/questions/react?title=react%20hooks')).toBe(
		'/ru/questions/react?title=react%20hooks',
	);
});
it('login отклоняет oversized body до upstream', async () => {
	const response = await login(request('login', '', { username: 'a', password: 'x'.repeat(9000) }));
	expect(response.status).toBe(413);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('refresh без cookie завершает сессию без upstream', async () => {
	const response = await refresh(request('refresh'));
	expect(response.status).toBe(401);
	expect(response.headers.getSetCookie()).toHaveLength(2);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('ошибка refresh также объединяется для параллельных запросов', async () => {
	fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
	const cookie = `yh_web_refresh=concurrent-failure-${count}`;
	const results = await Promise.all([
		refresh(request('refresh', cookie)),
		refresh(request('refresh', cookie)),
	]);
	expect(results.map((result) => result.status)).toEqual([401, 401]);
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('malformed backend credentials не выдаются браузеру', async () => {
	fetchMock.mockResolvedValue(Response.json({ access_token: 'secret-without-refresh' }));
	const response = await login(request('login', '', { username: 'a', password: 'b' }));
	expect(response.status).toBe(503);
	expect(response.headers.getSetCookie()).toHaveLength(0);
	expect(await response.text()).not.toContain('secret-without-refresh');
});

it('BFF использует предоставленные API_URL/LANDING_URL без AUTH_*', async () => {
	delete process.env.AUTH_API_URL;
	delete process.env.AUTH_WEB_ORIGIN;
	process.env.API_URL = 'http://localhost:4002';
	process.env.LANDING_URL = web;
	process.env.PORT = '3000';
	fetchMock
		.mockResolvedValueOnce(credentials('existing-env'))
		.mockResolvedValueOnce(Response.json(profile()));
	const response = await login(
		request('login', '', { username: 'a@local.invalid', password: 'b' }),
	);
	expect(response.status).toBe(200);
	expect(fetchMock.mock.calls[0][0].href).toBe('http://localhost:4002/auth/login');
	expect(response.headers.getSetCookie()).toHaveLength(2);
});
