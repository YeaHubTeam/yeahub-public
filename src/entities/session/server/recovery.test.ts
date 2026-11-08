import { NextRequest } from 'next/server';

import { forgotPassword, recoveryContext, resetPassword } from './recovery';
import { RECOVERY_COOKIE, captureRecoveryLink } from './recoveryLink';

const token = 'a'.repeat(40);
const values = {
	password: 'StrongPass1!',
	passwordConfirm: 'StrongPass1!',
	context: recoveryContext(token),
};
const request = (
	body: unknown,
	origin: string | null = 'http://localhost:3000',
	withToken = true,
) =>
	new NextRequest('http://localhost:3000/api/auth/password-recovery', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			...(origin ? { Origin: origin } : {}),
			...(withToken ? { Cookie: `${RECOVERY_COOKIE}=${token}` } : {}),
		},
		body: JSON.stringify(body),
	});
let fetchMock: jest.Mock;
beforeEach(() => {
	process.env.AUTH_API_URL = 'http://localhost:4002';
	process.env.AUTH_WEB_ORIGIN = 'http://localhost:3000';
	fetchMock = jest.fn();
	global.fetch = fetchMock;
});
it('forgot POST BFF → GET Nest: encoded email, no-store, redirect error, allowlisted response', async () => {
	fetchMock.mockResolvedValue(
		Response.json({ message: 'Reset email was sent', private: 'never-forward' }),
	);
	const result = await forgotPassword(request({ email: 'user+local@example.invalid' }));
	expect(result.status).toBe(200);
	expect(await result.json()).toEqual({ ok: true });
	const [url, options] = fetchMock.mock.calls[0];
	expect(url.pathname).toBe('/auth/send-reset-password');
	expect(url.searchParams.get('email')).toBe('user+local@example.invalid');
	expect(options).toMatchObject({ method: 'GET', cache: 'no-store', redirect: 'error' });
	expect(options.body).toBeUndefined();
	expect(result.headers.get('cache-control')).toBe('private, no-store');
});
it.each([null, 'http://evil.invalid'])(
	'Origin guard rejects %s before upstream',
	async (origin) => {
		expect((await forgotPassword(request({ email: 'user@local.invalid' }, origin))).status).toBe(
			403,
		);
		expect((await resetPassword(request(values, origin))).status).toBe(403);
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('sec-fetch-site cross-site blocked', async () => {
	const req = request(values);
	req.headers.set('sec-fetch-site', 'cross-site');
	expect((await resetPassword(req)).status).toBe(403);
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each(['bad', '', null, 'x'.repeat(321)])('invalid email rejected locally %s', async (email) => {
	expect((await forgotPassword(request({ email }))).status).toBe(400);
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each([403, 429])('mail throttle %s is safe', async (status) => {
	fetchMock.mockResolvedValue(Response.json({ private: token }, { status }));
	const response = await forgotPassword(request({ email: 'user@local.invalid' }));
	expect(response.status).toBe(429);
	expect(await response.json()).toEqual({ error: 'TRY_LATER' });
});
it.each([401, 403, 404, 410])(
	'invalid/expired recovery %s clears cookie without echo',
	async (status) => {
		fetchMock.mockResolvedValue(Response.json({ token, password: values.password }, { status }));
		const response = await resetPassword(request(values));
		expect(await response.json()).toEqual({ error: 'RECOVERY_LINK_INVALID' });
		expect(response.cookies.get(RECOVERY_COOKIE)?.maxAge).toBe(0);
	},
);
it('missing token rejected before upstream; body token cannot replace HttpOnly cookie', async () => {
	const result = await resetPassword(request({ ...values, token }, undefined, false));
	expect(result.status).toBe(400);
	expect(fetchMock).not.toHaveBeenCalled();
	expect(await result.text()).not.toContain(token);
});
it.each([
	{ password: 'weak', passwordConfirm: 'weak' },
	{ ...values, passwordConfirm: 'OtherPass1!' },
	{ ...values, password: '' },
	{ ...values, password: 'Aa1!' + 'x'.repeat(252) },
])('invalid reset body blocked', async (body) => {
	expect((await resetPassword(request(body))).status).toBe(400);
	expect(fetchMock).not.toHaveBeenCalled();
});
it('successful reset consumes backend credentials into AUTH-01 cookies without browser JSON tokens', async () => {
	fetchMock.mockResolvedValue(
		Response.json(
			{ access_token: 'reset-access', private: token },
			{ headers: { 'Set-Cookie': 'refresh_token=reset-refresh; HttpOnly' } },
		),
	);
	const response = await resetPassword(
		request({
			...values,
			token: 'b'.repeat(40),
			roles: ['admin'],
			returnPage: '/ru/questions?page=2',
		}),
	);
	expect(response.status).toBe(200);
	const [url, options] = fetchMock.mock.calls[0];
	expect(url.pathname).toBe('/auth/reset-password');
	expect(options.method).toBe('PATCH');
	expect(JSON.parse(options.body)).toEqual({
		password: values.password,
		passwordConfirm: values.passwordConfirm,
		token,
	});
	expect(await response.json()).toEqual({
		ok: true,
		loginUrl: '/ru/auth/login?returnPage=%2Fru%2Fquestions%3Fpage%3D2',
	});
	expect(response.cookies.get('yh_web_access')).toMatchObject({
		value: 'reset-access',
		httpOnly: true,
		sameSite: 'lax',
	});
	expect(response.cookies.get('yh_web_refresh')).toMatchObject({
		value: 'reset-refresh',
		httpOnly: true,
	});
	expect(response.cookies.get(RECOVERY_COOKIE)?.maxAge).toBe(0);
});
it('reset success without credentials does not invite repeating a consumed reset', async () => {
	fetchMock.mockResolvedValue(Response.json({}));
	const response = await resetPassword(request({ ...values, returnPage: 'https://evil.invalid' }));
	expect(await response.json()).toEqual({
		ok: true,
		sessionEstablished: false,
		loginUrl: '/ru/auth/login',
	});
	expect(response.cookies.get('yh_web_access')?.maxAge).toBe(0);
});
it.each([400, 422, 429, 500])('backend reset errors %s are sanitized', async (status) => {
	fetchMock.mockResolvedValue(Response.json({ secret: token }, { status }));
	const response = await resetPassword(request(values));
	expect(await response.text()).not.toContain(token);
	expect(response.status).toBe(status === 429 ? 429 : status === 500 ? 502 : 400);
});
it('network failure does not log credentials or retry', async () => {
	const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	try {
		fetchMock.mockRejectedValue(new Error(`${token}/${values.password}`));
		const result = await resetPassword(request(values));
		expect(await result.json()).toEqual({ error: 'RECOVERY_UNAVAILABLE' });
		expect(log).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	} finally {
		log.mockRestore();
	}
});
it('oversized or malformed payload never reaches Nest', async () => {
	expect((await resetPassword(request({ password: 'x'.repeat(5000) }))).status).toBe(400);
	const req = request(values);
	req.headers.set('content-type', 'text/plain');
	expect((await resetPassword(req)).status).toBe(400);
	expect(fetchMock).not.toHaveBeenCalled();
});
it.each(['/auth/password-recovery', '/ru/auth/password-recovery'])(
	'email link %s is cleaned before HTML/analytics',
	(path) => {
		const result = captureRecoveryLink(
			new NextRequest(`https://localhost:3000${path}?token=${token}&returnPage=%2Fru%2Fquestions`),
		)!;
		expect(result.status).toBe(303);
		expect(result.headers.get('location')).toBe(
			'https://localhost:3000/ru/auth/password-recovery?returnPage=%2Fru%2Fquestions',
		);
		expect(result.cookies.get(RECOVERY_COOKIE)).toMatchObject({
			value: token,
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 3600,
		});
		expect(result.headers.get('referrer-policy')).toBe('no-referrer');
		expect(result.headers.get('cache-control')).toBe('private, no-store');
	},
);
it.each(['token=bad', 'token=', 'token=' + token + '&token=' + token])(
	'malformed/duplicate link cleans URL and clears stale cookie',
	(query) => {
		const response = captureRecoveryLink(
			new NextRequest(
				'http://localhost:3000/ru/auth/password-recovery?' +
					query +
					'&returnPage=https://evil.invalid',
			),
		)!;
		expect(response.headers.get('location')).toBe(
			'http://localhost:3000/ru/auth/password-recovery',
		);
		expect(response.cookies.get(RECOVERY_COOKIE)?.maxAge).toBe(0);
	},
);
it('clean recovery URL and other routes are not intercepted', () => {
	expect(
		captureRecoveryLink(new NextRequest('http://localhost:3000/ru/auth/password-recovery')),
	).toBeNull();
	expect(
		captureRecoveryLink(new NextRequest('http://localhost:3000/ru/questions?token=bad')),
	).toBeNull();
});

it('a different link in another tab cannot change this form account', async () => {
	const response = await resetPassword(
		request({ ...values, context: recoveryContext('b'.repeat(40)) }),
	);
	expect(await response.json()).toEqual({ error: 'RECOVERY_LINK_INVALID' });
	expect(fetchMock).not.toHaveBeenCalled();
	expect(response.cookies.get(RECOVERY_COOKIE)).toBeUndefined();
});
