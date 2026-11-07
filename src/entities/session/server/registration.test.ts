import { NextRequest } from 'next/server';

import { session } from './handlers';
import { register } from './registration';

const valid = {
	username: 'LocalUser',
	email: 'user@local.invalid',
	password: 'StrongPass1!',
	passwordConfirmation: 'StrongPass1!',
	privacyConsent: true,
	offerConsent: true,
	adConsent: false,
};
const profile = {
	id: 'local-user',
	username: 'LocalUser',
	email: valid.email,
	isVerified: false,
	userRoles: [{ name: 'candidate-free' }],
	profiles: [{ id: 'local-profile', isActive: true, specializationId: 1 }],
	passwordHash: 'never-forward',
};
const request = (body: unknown, origin: string | null = 'http://localhost:3000') =>
	new NextRequest('http://localhost:3000/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
		body: JSON.stringify(body),
	});
let fetchMock: jest.Mock;
beforeEach(() => {
	process.env.AUTH_API_URL = 'http://localhost:4002';
	process.env.AUTH_WEB_ORIGIN = 'http://localhost:3000';
	fetchMock = jest.fn();
	global.fetch = fetchMock;
});
const signup = () =>
	Response.json(
		{ access_token: 'signup-access', refresh_token: 'never-forward', user: profile },
		{
			status: 201,
			headers: { 'Set-Cookie': 'refresh_token=signup-refresh; HttpOnly; Secure; SameSite=None' },
		},
	);
it('signup устанавливает AUTH-01 cookies/session без повторного login и раскрытия tokens', async () => {
	fetchMock
		.mockResolvedValueOnce(signup())
		.mockResolvedValueOnce(Response.json(profile))
		.mockResolvedValueOnce(Response.json(profile));
	const response = await register(
		request({
			...valid,
			roles: ['admin'],
			userId: 'other',
			refId: 'LOCAL',
			returnPage: '/ru/questions/react/example?page=2#answer',
		}),
	);
	expect(response.status).toBe(201);
	expect(fetchMock.mock.calls[0][0].href).toBe('http://localhost:4002/auth/signUp');
	expect(fetchMock.mock.calls[0][1].method).toBe('POST');
	const upstreamBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
	expect(upstreamBody).toMatchObject({ ...valid, refId: 'LOCAL' });
	expect(upstreamBody).not.toHaveProperty('roles');
	expect(upstreamBody).not.toHaveProperty('userId');
	expect(upstreamBody).not.toHaveProperty('returnPage');
	expect(response.headers.get('cache-control')).toBe('private, no-store');
	const cookies = response.cookies.getAll();
	expect(cookies.map((cookie) => cookie.name)).toEqual(['yh_web_access', 'yh_web_refresh']);
	expect(
		cookies.every(
			(cookie) =>
				cookie.httpOnly && cookie.path === '/' && cookie.sameSite === 'lax' && !cookie.domain,
		),
	).toBe(true);
	const body = await response.text();
	expect(body).not.toMatch(/signup-access|signup-refresh|never-forward|passwordHash/);
	expect(JSON.parse(body).returnUrl).toBe('/ru/questions/react/example?page=2#answer');
	const restored = await session(
		new NextRequest('http://localhost:3000/api/auth/session', {
			headers: { Cookie: cookies.map(({ name, value }) => `${name}=${value}`).join('; ') },
		}),
	);
	expect(restored.status).toBe(200);
	expect((await restored.json()).session.activeProfile.id).toBe('local-profile');
	expect(fetchMock.mock.calls.map(([url]: [URL]) => url.pathname)).not.toContain('/auth/login');
});
it.each([null, 'https://evil.invalid'])('отказывает Origin %s до upstream', async (origin) => {
	expect((await register(request(valid, origin))).status).toBe(403);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('validation errors не вызывают signup', async () => {
	const response = await register(
		request({ ...valid, offerConsent: false, passwordConfirmation: 'wrong' }),
	);
	expect(response.status).toBe(400);
	expect((await response.json()).fields).toMatchObject({
		offerConsent: 'consentRequired',
		passwordConfirmation: 'passwordMismatch',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});
it('повторяющийся email: 409 без raw upstream payload/cookies', async () => {
	fetchMock.mockResolvedValue(
		Response.json({ message: 'user.user.conflict', private: 'never-forward' }, { status: 409 }),
	);
	const response = await register(request(valid));
	expect(response.status).toBe(409);
	expect(await response.json()).toEqual({
		error: 'ACCOUNT_CONFLICT',
		fields: { email: 'accountConflict' },
	});
	expect(response.headers.getSetCookie()).toHaveLength(0);
});
it.each([400, 422, 429, 500])('безопасно обрабатывает upstream %s', async (status) => {
	fetchMock.mockResolvedValue(Response.json({ token: 'never-forward' }, { status }));
	const response = await register(request(valid));
	expect(response.status).toBe(status === 422 ? 400 : status === 500 ? 502 : status);
	expect(await response.text()).not.toContain('never-forward');
	expect(response.headers.getSetCookie()).toHaveLength(0);
});
it('network failure без автоматического повторения signup', async () => {
	fetchMock.mockRejectedValue(new Error('private-network-details'));
	const response = await register(request(valid));
	expect(response.status).toBe(503);
	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(await response.text()).not.toContain('private-network-details');
});
it('созданный аккаунт и сбой profile: отдельная ошибка для восстановления через login', async () => {
	fetchMock.mockResolvedValueOnce(signup()).mockRejectedValueOnce(new Error('profile-failure'));
	const response = await register(request(valid));
	expect(response.status).toBe(502);
	expect(await response.json()).toEqual({ error: 'REGISTRATION_SESSION_FAILED' });
	expect(response.headers.getSetCookie()).toHaveLength(0);
	expect(fetchMock).toHaveBeenCalledTimes(2);
});
it('отвергает внешний returnPage после auto-login', async () => {
	fetchMock.mockResolvedValueOnce(signup()).mockResolvedValueOnce(Response.json(profile));
	expect(
		(await (await register(request({ ...valid, returnPage: 'https://evil.invalid' }))).json())
			.returnUrl,
	).toBe('/ru/auth/login');
});
it('ограничивает размер body', async () => {
	const response = await register(request({ ...valid, extra: 'x'.repeat(9000) }));
	expect(response.status).toBe(413);
	expect(fetchMock).not.toHaveBeenCalled();
});
