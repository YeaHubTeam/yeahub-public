import {
	BackendAuthError,
	createBackendAuthTransport,
	diagnoseBackendAuthResponse,
} from './backendAuth.server';

jest.mock('server-only', () => ({}), { virtual: true });

const origin = 'https://backend.example';
const user = {
	id: 'synthetic-user',
	username: 'sample',
	email: 'sample@example.com',
	phone: '',
	country: null,
	city: null,
	birthday: null,
	address: null,
	avatarUrl: null,
	updatedAt: '2026-01-01T00:00:00.000Z',
	createdAt: '2026-01-01T00:00:00.000Z',
	userRoles: [{ id: 1, name: 'candidate', permissions: [{ id: 1, name: 'read' }] }],
	isVerified: false,
	isEmailNotificationsEnable: true,
};
const identity = { id: user.id, username: user.username, avatarUrl: user.avatarUrl };
const loginResult = {
	access_token: 'synthetic-access',
	user: identity,
	refreshToken: 'synthetic-refresh',
};
const fullLoginResult = { ...loginResult, user: { ...identity, email: user.email } };
const authBody = { access_token: 'synthetic-access', user };
const json = (body: unknown, status = 200, cookies: string[] = []) => {
	const headers = new Headers({ 'Content-Type': 'application/json' });
	for (const cookie of cookies) headers.append('Set-Cookie', cookie);
	return new Response(JSON.stringify(body), { status, headers });
};
const success = () => json(authBody, 200, ['refresh_token=synthetic-refresh; HttpOnly; Secure']);
const setup = () => {
	const fetcher = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
	const transport = createBackendAuthTransport({
		apiOrigin: origin,
		allowedOrigins: [origin],
		fetch: fetcher,
	});
	return { fetcher, transport };
};

describe.each(['login', 'refresh'] as const)('%s optional identity email', (operation) => {
	it.each([
		{ label: 'string', email: 'server@example.invalid', expected: 'server@example.invalid' },
		{
			label: 'string preserved verbatim',
			email: ' server@example.invalid ',
			expected: ' server@example.invalid ',
		},
		{ label: 'empty string', email: '', expected: '' },
		{ label: 'null', email: null, expected: null },
		{ label: 'missing' },
		{ label: 'number', email: 42 },
		{ label: 'boolean', email: false },
		{ label: 'object', email: { value: 'must-not-copy' } },
		{ label: 'array', email: ['must-not-copy'] },
	])('projects only a string or null: $label', async (testCase) => {
		const { transport, fetcher } = setup();
		const responseUser = {
			...identity,
			...('email' in testCase ? { email: testCase.email } : {}),
			privateExtra: 'must-not-copy',
		};
		fetcher.mockResolvedValue(
			json(
				{ access_token: authBody.access_token, user: responseUser },
				operation === 'login' ? 201 : 200,
				['refresh_token=synthetic-refresh'],
			),
		);
		const result =
			operation === 'login'
				? await transport.login({
						username: 'input@example.invalid',
						password: 'synthetic-password',
					})
				: await transport.refresh('synthetic-old-refresh');
		expect(result).toEqual({
			...loginResult,
			user: { ...identity, ...('expected' in testCase ? { email: testCase.expected } : {}) },
		});
		expect(Object.prototype.hasOwnProperty.call(result.user, 'email')).toBe('expected' in testCase);
		expect(result.user).not.toHaveProperty('privateExtra');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});

describe('backend auth server transport', () => {
	it('returns no diagnostic for a valid response', () => {
		expect(diagnoseBackendAuthResponse(authBody)).toBeUndefined();
	});
	it.each([
		{
			data: { ...authBody, user: { ...user, phone: null } },
			path: 'user.phone',
			expected: 'string',
			actual: 'null',
		},
		{
			data: { ...authBody, user: { ...user, phone: undefined } },
			path: 'user.phone',
			expected: 'string',
			actual: 'missing',
		},
		{
			data: { ...authBody, user: { ...user, phone: 123 } },
			path: 'user.phone',
			expected: 'string',
			actual: 'number',
		},
		{
			data: { ...authBody, user: { ...user, phone: false } },
			path: 'user.phone',
			expected: 'string',
			actual: 'boolean',
		},
		{
			data: { ...authBody, user: { ...user, phone: [] } },
			path: 'user.phone',
			expected: 'string',
			actual: 'array',
		},
		{
			data: { ...authBody, user: { ...user, phone: {} } },
			path: 'user.phone',
			expected: 'string',
			actual: 'object',
		},
		{
			data: { ...authBody, user: { ...user, isVerified: 'synthetic-private-value' } },
			path: 'user.isVerified',
			expected: 'boolean',
			actual: 'string',
		},
		{
			data: { ...authBody, user: { ...user, country: undefined } },
			path: 'user.country',
			expected: 'string|null',
			actual: 'missing',
		},
		{
			data: { ...authBody, user: { ...user, userRoles: [{ id: 1, name: 'sample' }] } },
			path: 'user.userRoles[0].permissions',
			expected: 'array',
			actual: 'missing',
		},
		{
			data: {
				...authBody,
				user: {
					...user,
					userRoles: [
						{
							id: 1,
							name: 'sample',
							permissions: [{ id: 'synthetic-private-id', name: 'sample' }],
						},
					],
				},
			},
			path: 'user.userRoles[0].permissions[0].id',
			expected: 'number',
			actual: 'string',
		},
		{ data: { user }, path: 'access_token', expected: 'nonempty token string', actual: 'missing' },
		{ data: null, path: '$', expected: 'object', actual: 'null' },
	])('reports only schema metadata for $path ($actual)', ({ data, path, expected, actual }) => {
		expect(diagnoseBackendAuthResponse(data)).toEqual({
			stage: 'response-body',
			path,
			expected,
			actual,
		});
	});
	it('attaches safe diagnostics without changing public error text', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ ...authBody, user: { ...user, id: null } }, 201, [
				'refresh_token=synthetic-refresh; HttpOnly; Secure',
			]),
		);
		let failure: unknown;
		try {
			await transport.refresh('synthetic-refresh');
		} catch (error) {
			failure = error;
		}
		expect(failure).toMatchObject({
			kind: 'protocol',
			status: 201,
			message: 'Backend auth protocol failure (201)',
			diagnostic: {
				stage: 'response-body',
				path: 'user.id',
				expected: 'nonempty string',
				actual: 'null',
			},
		});
		expect(JSON.stringify(failure)).not.toMatch(
			/sample@example|synthetic-password|synthetic-access|synthetic-refresh/,
		);
	});
	it('separates missing refresh cookie from response validation', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json(authBody, 201));
		await expect(
			transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
		).rejects.toMatchObject({
			message: 'Backend auth protocol failure (201)',
			diagnostic: {
				stage: 'refresh-cookie',
				path: 'refresh_token',
				expected: 'single nonempty token cookie',
				actual: 'missing',
			},
		});
	});
	it('never copies unexpected response keys or values into diagnostics', () => {
		const diagnostic = diagnoseBackendAuthResponse({
			...authBody,
			user: { ...user, phone: { 'synthetic-private-key': 'synthetic-private-value' } },
			password: 'synthetic-password',
		});
		expect(diagnostic).toEqual({
			stage: 'response-body',
			path: 'user.phone',
			expected: 'string',
			actual: 'object',
		});
		expect(JSON.stringify(diagnostic)).not.toMatch(/synthetic|sample@example/);
	});
	it.each([200, 201])(
		'accepts login HTTP %s with valid JSON and refresh cookie',
		async (status) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				json(authBody, status, ['refresh_token=synthetic-refresh; HttpOnly; Secure']),
			);
			await expect(
				transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
			).resolves.toEqual(fullLoginResult);
			expect(fetcher).toHaveBeenCalledTimes(1);
		},
	);

	it('rejects malformed JSON rather than rejecting the successful 201 status', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			new Response('{invalid synthetic-json', {
				status: 201,
				headers: { 'Set-Cookie': 'refresh_token=synthetic-refresh; HttpOnly; Secure' },
			}),
		);
		await expect(
			transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
		).rejects.toMatchObject({ kind: 'protocol', status: 201 });
	});

	it('rejects login 201 without the expected refresh cookie', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json(authBody, 201));
		await expect(
			transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
		).rejects.toMatchObject({ kind: 'protocol', status: 201 });
	});

	it('accepts nullable backend phone at login', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ ...authBody, user: { ...user, phone: null } }, 201, [
				'refresh_token=synthetic-refresh; HttpOnly; Secure',
			]),
		);
		await expect(
			transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
		).resolves.toEqual(fullLoginResult);
	});

	it.each([200, 201])('accepts minimal login identity at HTTP %s', async (status) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ access_token: authBody.access_token, user: identity }, status, [
				'refresh_token=synthetic-refresh',
			]),
		);
		await expect(
			transport.login({ username: 'sample', password: 'synthetic-password' }),
		).resolves.toEqual(loginResult);
	});
	it.each([
		{ id: user.id, username: user.username },
		{ ...identity, email: null },
		{ ...identity, phone: null },
		{ ...identity, avatarUrl: 'https://images.example/avatar.png' },
	])('normalizes and projects login identity %#', async (loginUser) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ access_token: authBody.access_token, user: loginUser }, 201, [
				'refresh_token=synthetic-refresh',
			]),
		);
		await expect(
			transport.login({ username: 'sample', password: 'synthetic-password' }),
		).resolves.toEqual({
			...loginResult,
			user: {
				id: user.id,
				username: user.username,
				avatarUrl: 'avatarUrl' in loginUser ? loginUser.avatarUrl : null,
				...('email' in loginUser ? { email: loginUser.email } : {}),
			},
		});
	});
	it.each([
		{ ...identity, id: undefined },
		{ ...identity, id: null },
		{ ...identity, id: 1 },
		{ ...identity, id: '' },
		{ ...identity, id: '   ' },
		{ ...identity, username: undefined },
		{ ...identity, username: null },
		{ ...identity, username: false },
		{ ...identity, username: '' },
		{ ...identity, username: '   ' },
		{ ...identity, avatarUrl: {} },
		null,
		[],
	])('rejects invalid login identity %# without leaking values', async (loginUser) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ ...authBody, user: loginUser }, 201, ['refresh_token=synthetic-refresh']),
		);
		try {
			await transport.login({ username: 'sample', password: 'synthetic-password' });
			throw new Error('Expected rejection');
		} catch (error) {
			expect(error).toBeInstanceOf(BackendAuthError);
			expect(error).toMatchObject({ kind: 'protocol', diagnostic: { stage: 'response-body' } });
			expect(JSON.stringify(error)).not.toMatch(/synthetic|sample/);
		}
	});
	it.each([undefined, null, '', 'bad token', 'bad;token', 42])(
		'rejects invalid login access token %#',
		async (access_token) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				json({ access_token, user: identity }, 201, ['refresh_token=synthetic-refresh']),
			);
			await expect(
				transport.login({ username: 'sample', password: 'synthetic-password' }),
			).rejects.toMatchObject({ kind: 'protocol', diagnostic: { path: 'access_token' } });
		},
	);
	it.each([
		{ cookies: [] },
		{ cookies: ['refresh_token='] },
		{ cookies: ['refresh_token=one', 'refresh_token=two'] },
		{ cookies: ['refresh_token="bad token"'] },
	])('rejects invalid login refresh cookies %#', async ({ cookies }) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json({ ...authBody, user: identity }, 201, cookies));
		await expect(
			transport.login({ username: 'sample', password: 'synthetic-password' }),
		).rejects.toMatchObject({ kind: 'protocol', diagnostic: { stage: 'refresh-cookie' } });
	});
	it('accepts minimal refresh identity while keeping full profile validation', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ ...authBody, user: identity }, 200, ['refresh_token=synthetic-refresh']),
		);
		await expect(transport.refresh('synthetic-refresh')).resolves.toEqual(loginResult);
		fetcher.mockResolvedValue(json(identity));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({ kind: 'protocol' });
	});

	it.each([
		identity,
		{ id: user.id, username: user.username },
		{ ...identity, phone: null, email: null },
		{ ...identity, avatarUrl: 'https://images.example/avatar' },
	])('accepts and projects minimal refresh identity %#', async (refreshUser) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ access_token: authBody.access_token, user: refreshUser }, 200, [
				'refresh_token=synthetic-refresh',
			]),
		);
		await expect(transport.refresh('synthetic-old-refresh')).resolves.toEqual({
			...loginResult,
			user: {
				id: user.id,
				username: user.username,
				avatarUrl: 'avatarUrl' in refreshUser ? refreshUser.avatarUrl : null,
				...('email' in refreshUser ? { email: refreshUser.email } : {}),
			},
		});
	});
	it.each([
		{ ...identity, id: undefined },
		{ ...identity, id: null },
		{ ...identity, id: '' },
		{ ...identity, id: ' ' },
		{ ...identity, id: 1 },
		{ ...identity, username: undefined },
		{ ...identity, username: null },
		{ ...identity, username: '' },
		{ ...identity, username: ' ' },
		{ ...identity, username: false },
		{ ...identity, avatarUrl: 42 },
		null,
		[],
	])('rejects invalid refresh identity %# with safe diagnostics', async (refreshUser) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json({ ...authBody, user: refreshUser }, 200, ['refresh_token=synthetic-new-refresh']),
		);
		let failure: unknown;
		try {
			await transport.refresh('synthetic-old-refresh');
		} catch (error) {
			failure = error;
		}
		expect(failure).toBeInstanceOf(BackendAuthError);
		expect(failure).toMatchObject({ kind: 'protocol', diagnostic: { stage: 'response-body' } });
		expect(JSON.stringify(failure)).not.toMatch(/synthetic|sample/);
	});
	it.each([undefined, null, '', 'bad token', 'bad;token', 42])(
		'rejects invalid refresh access token %#',
		async (access_token) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				json({ access_token, user: identity }, 200, ['refresh_token=synthetic-refresh']),
			);
			await expect(transport.refresh('synthetic-old-refresh')).rejects.toMatchObject({
				kind: 'protocol',
				diagnostic: { path: 'access_token' },
			});
		},
	);
	it.each([401, 500, 503])(
		'preserves refresh HTTP %s without retry or credential leakage',
		async (status) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				json({ message: 'auth.auth.unauthorized', details: 'synthetic-old-refresh' }, status),
			);
			await expect(transport.refresh('synthetic-old-refresh')).rejects.toMatchObject({
				kind: 'http',
				status,
				message: `Backend auth http failure (${status})`,
			});
			expect(fetcher).toHaveBeenCalledTimes(1);
		},
	);
	it.each(['{broken', '', 'null', '[]'])('rejects malformed refresh body %#', async (body) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			new Response(body, {
				status: 200,
				headers: { 'Set-Cookie': 'refresh_token=synthetic-refresh' },
			}),
		);
		await expect(transport.refresh('synthetic-old-refresh')).rejects.toMatchObject({
			kind: 'protocol',
			diagnostic: { stage: 'response-body' },
		});
	});
	it('keeps nullable phone invalid in the full profile contract', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json({ ...user, phone: null }));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({ kind: 'protocol' });
	});

	it.each([401, 418])(
		'preserves login HTTP error %s without exposing credentials',
		async (status) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				json(
					{ message: 'auth.auth.unauthorized', description: 'synthetic-password synthetic-access' },
					status,
				),
			);
			let failure: unknown;
			try {
				await transport.login({ username: 'sample@example.com', password: 'synthetic-password' });
			} catch (error) {
				failure = error;
			}
			expect(failure).toMatchObject({ kind: 'http', status, code: 'auth.auth.unauthorized' });
			expect(String(failure)).not.toMatch(/synthetic-password|synthetic-access/);
			expect(JSON.stringify(failure)).not.toMatch(/synthetic-password|synthetic-access/);
			expect(fetcher).toHaveBeenCalledTimes(1);
		},
	);

	it('posts login to the fixed path, without cache or redirects', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(success());
		expect(
			await transport.login({ username: 'sample@example.com', password: 'synthetic-password' }),
		).toEqual(fullLoginResult);
		expect(fetcher).toHaveBeenCalledWith(`${origin}/auth/login`, {
			method: 'POST',
			body: JSON.stringify({ username: 'sample@example.com', password: 'synthetic-password' }),
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
		});
	});
	it('sends only the expected cookie for refresh', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(success());
		await transport.refresh('synthetic-old-refresh');
		expect(fetcher).toHaveBeenCalledWith(
			`${origin}/auth/refresh`,
			expect.objectContaining({
				method: 'GET',
				headers: { Cookie: 'refresh_token=synthetic-old-refresh' },
				cache: 'no-store',
				redirect: 'manual',
			}),
		);
	});
	it('gets profile with Bearer and no cookie', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json(user));
		expect(await transport.profile('synthetic-access')).toEqual(user);
		expect(fetcher).toHaveBeenCalledWith(
			`${origin}/auth/profile`,
			expect.objectContaining({
				method: 'GET',
				headers: { Authorization: 'Bearer synthetic-access' },
				cache: 'no-store',
				redirect: 'manual',
			}),
		);
	});
	it('handles empty logout with Bearer', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(new Response(null, { status: 200 }));
		await expect(transport.logout('synthetic-access')).resolves.toBeUndefined();
		expect(fetcher).toHaveBeenCalledWith(
			`${origin}/auth/logout`,
			expect.objectContaining({
				method: 'GET',
				headers: { Authorization: 'Bearer synthetic-access' },
				cache: 'no-store',
			}),
		);
	});
	it('parses multiple Set-Cookie headers including an Expires comma', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(
			json(authBody, 200, [
				'other=ignored; Expires=Wed, 21 Oct 2037 07:28:00 GMT',
				'refresh_token=synthetic-new-refresh; HttpOnly; Secure; SameSite=None',
			]),
		);
		expect((await transport.refresh('synthetic-old-refresh')).refreshToken).toBe(
			'synthetic-new-refresh',
		);
	});
	it.each([
		{ cookies: [] },
		{ cookies: ['not_refresh_token=synthetic'] },
		{ cookies: ['refresh_token=one', 'refresh_token=two'] },
		{ cookies: ['refresh_token='] },
		{ cookies: ['refresh_token="bad token"'] },
	])('rejects missing or ambiguous refresh cookies: %j', async ({ cookies }) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json(authBody, 200, cookies));
		await expect(transport.refresh('synthetic-refresh')).rejects.toMatchObject({
			kind: 'protocol',
			status: 200,
		});
	});
	it.each([401, 403, 500])('preserves HTTP status %s and code without retry', async (status) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(json({ message: 'auth.auth.unauthorized' }, status));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({
			kind: 'http',
			status,
			code: 'auth.auth.unauthorized',
		});
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
	it('sanitizes network failures', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockRejectedValue(new Error('synthetic-access synthetic-refresh'));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({
			kind: 'network',
			message: 'Backend auth network failure',
		});
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
	it('sanitizes non-JSON HTTP errors', async () => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(new Response('<html>synthetic-access</html>', { status: 502 }));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({
			kind: 'http',
			status: 502,
			message: 'Backend auth http failure (502)',
		});
	});
	it.each(['', '<html>OK</html>', '{}'])('rejects malformed successful DTO %s', async (body) => {
		const { transport, fetcher } = setup();
		fetcher.mockResolvedValue(new Response(body));
		await expect(transport.profile('synthetic-access')).rejects.toMatchObject({ kind: 'protocol' });
	});
	it.each([
		'https://evil.example',
		`${origin}/auth/login`,
		`${origin}?url=evil`,
		'https://user:password@backend.example',
		'http://backend.example',
		'//backend.example',
	])('rejects unapproved origin %s', (apiOrigin) => {
		expect(() => createBackendAuthTransport({ apiOrigin, allowedOrigins: [origin] })).toThrow(
			BackendAuthError,
		);
	});
	it('allows explicitly configured local HTTP only', () => {
		expect(() =>
			createBackendAuthTransport({
				apiOrigin: 'http://localhost:3001',
				allowedOrigins: ['http://localhost:3001'],
				allowLocalHttp: true,
			}),
		).not.toThrow();
	});
	it.each(['login', 'refresh', 'profile'] as const)(
		'rejects %s redirects without following them',
		async (operation) => {
			const { transport, fetcher } = setup();
			fetcher.mockResolvedValue(
				new Response(null, { status: 302, headers: { Location: 'https://evil.example' } }),
			);
			await expect(
				operation === 'login'
					? transport.login({ username: 'sample', password: 'synthetic-password' })
					: operation === 'refresh'
						? transport.refresh('synthetic-old-refresh')
						: transport.profile('synthetic-access'),
			).rejects.toMatchObject({
				kind: 'http',
				status: 302,
			});
			expect(fetcher).toHaveBeenCalledTimes(1);
		},
	);
	it('rejects header injection before fetching', async () => {
		const { transport, fetcher } = setup();
		await expect(transport.refresh('synthetic; other=cookie')).rejects.toMatchObject({
			kind: 'configuration',
		});
		await expect(transport.profile('synthetic\r\nHeader: value')).rejects.toMatchObject({
			kind: 'configuration',
		});
		expect(fetcher).not.toHaveBeenCalled();
	});
	it('does not expose reflected credentials in errors or logs', async () => {
		const { transport, fetcher } = setup();
		const log = jest.spyOn(console, 'log'),
			error = jest.spyOn(console, 'error');
		try {
			fetcher.mockResolvedValue(
				json({ message: 'auth.synthetic.secret', description: 'synthetic-password' }, 401),
			);
			await expect(transport.profile('synthetic.secret')).rejects.toMatchObject({
				code: undefined,
				message: 'Backend auth http failure (401)',
			});
			expect(log).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
			error.mockRestore();
		}
	});
});
