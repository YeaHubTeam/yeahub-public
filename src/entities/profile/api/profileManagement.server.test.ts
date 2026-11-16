/** @jest-environment node */
import * as transport from '@/shared/api/index.server';

import { createOwnProfile, deleteOwnProfile, selectOwnProfile } from './profileManagement.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/api/index.server', () => {
	const actual = jest.requireActual('@/shared/api/index.server');
	return { ...actual, backendHttp: jest.fn(actual.backendHttp) };
});
const target = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = {
	userId: 'user-a',
	accessToken: 'synthetic-access',
	accessExpiresAt: 2000000000,
	sessionDeadline: 2000000100,
};
const body = (selected = false, specializationId = 11) => ({
	id: 'user-a',
	email: null,
	isVerified: true,
	profiles: [
		{ id: target, specializationId, isActive: selected },
		{ id: other, specializationId: 22, isActive: !selected },
	],
	subscriptions: [],
});
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
let request: jest.SpyInstance;
beforeEach(() => {
	jest.useFakeTimers().setSystemTime(1800000000000);
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const select = () => selectOwnProfile(target, credentials, config);
const prepare = () =>
	request
		.mockResolvedValueOnce(json(body()))
		.mockResolvedValueOnce(new Response(null, { status: 204 }));
it('performs one PATCH and requires readback, using the readback specialization', async () => {
	const response = new Response(null, { status: 204 });
	const parse = jest.spyOn(response, 'json');
	request
		.mockResolvedValueOnce(json(body()))
		.mockResolvedValueOnce(response)
		.mockResolvedValueOnce(json(body(true, 33)));
	expect(await select()).toEqual({
		status: 'success',
		profileId: target,
		specializationId: 33,
		changed: true,
	});
	expect(request).toHaveBeenCalledTimes(3);
	expect(parse).not.toHaveBeenCalled();
	expect(request.mock.calls[1]).toEqual([
		new URL(`https://backend.example/profiles/${target}/active`),
		expect.objectContaining({
			method: 'PATCH',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: new Headers({ Authorization: 'Bearer synthetic-access' }),
		}),
	]);
	expect(request.mock.calls[1][1].body).toBeUndefined();
	for (const [, options] of request.mock.calls) expect(options.cache).toBe('no-store');
});
it('uses a fresh already-active profile without PATCH or another GET', async () => {
	request.mockResolvedValueOnce(json(body(true)));
	expect(await select()).toEqual({
		status: 'success',
		profileId: target,
		specializationId: 11,
		changed: false,
	});
	expect(request).toHaveBeenCalledTimes(1);
});
it('returns not-found for foreign or missing profile ID without PATCH', async () => {
	request.mockResolvedValueOnce(
		json({ ...body(), profiles: [{ id: other, specializationId: 22, isActive: true }] }),
	);
	expect(await select()).toEqual({ status: 'not-found' });
	expect(request).toHaveBeenCalledTimes(1);
});
it.each([null, {}, '', 'not-uuid', '../profiles', '11111111-1111-4111-8111-111111111111/active'])(
	'rejects malformed ID %# without any request',
	async (id) => {
		expect(await selectOwnProfile(id, credentials, config)).toEqual({ status: 'not-found' });
		expect(request).not.toHaveBeenCalled();
	},
);
it.each([
	['accessExpiresAt', 'refresh-required'],
	['sessionDeadline', 'unauthenticated'],
] as const)('does not use expired %s', async (field, status) => {
	expect(await selectOwnProfile(target, { ...credentials, [field]: 1799999999 }, config)).toEqual({
		status,
	});
	expect(request).not.toHaveBeenCalled();
});
it.each([400, 401, 403, 404, 500])('maps PATCH HTTP %s without retry/readback', async (status) => {
	request
		.mockResolvedValueOnce(json(body()))
		.mockResolvedValueOnce(json({ message: 'auth.user.verified_required' }, status));
	expect(await select()).toEqual({
		status:
			status === 401
				? 'unauthenticated'
				: status === 403
					? 'forbidden'
					: status === 404
						? 'not-found'
						: status >= 500
							? 'outcome-unknown'
							: 'error',
	});
	expect(request).toHaveBeenCalledTimes(2);
});
it('does not parse a non-204 success as confirmation', async () => {
	request.mockResolvedValueOnce(json(body())).mockResolvedValueOnce(json({}, 200));
	expect(await select()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(2);
});
it.each([
	body(false),
	{ ...body(true), profiles: body(true).profiles.map((item) => ({ ...item, isActive: true })) },
	{ ...body(true), profiles: [] },
	{ ...body(true), id: 'other-user' },
	null,
])('reports incomplete readback %#', async (value) => {
	prepare().mockResolvedValueOnce(json(value));
	expect(await select()).toEqual({ status: 'incomplete' });
	expect(request).toHaveBeenCalledTimes(3);
});
it.each([401, 403, 500])(
	'reports readback HTTP %s as incomplete instead of success',
	async (status) => {
		prepare().mockResolvedValueOnce(json({}, status));
		expect(await select()).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	},
);
it('returns incomplete on readback network failure', async () => {
	prepare();
	expect(await select()).toEqual({ status: 'incomplete' });
	expect(request).toHaveBeenCalledTimes(3);
});
it('does not accept another user in the initial snapshot', async () => {
	request.mockResolvedValueOnce(json({ ...body(), id: 'other-user' }));
	expect(await select()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('handles initial read failure without mutation', async () => {
	expect(await select()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('returns unknown after PATCH network failure without retry', async () => {
	request.mockResolvedValueOnce(json(body()));
	expect(await select()).toEqual({ status: 'outcome-unknown' });
	expect(request).toHaveBeenCalledTimes(2);
});
it('times out and aborts PATCH after five seconds with no retry', async () => {
	let ready!: () => void;
	const started = new Promise<void>((resolve) => {
		ready = resolve;
	});
	request.mockResolvedValueOnce(json(body())).mockImplementationOnce(() => {
		ready();
		return new Promise(() => {});
	});
	const result = select();
	await started;
	const signal = request.mock.calls[1][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(2);
});
it('rechecks token expiry after initial read before PATCH', async () => {
	request.mockImplementationOnce(() => {
		jest.setSystemTime(2000000001000);
		return Promise.resolve(json(body()));
	});
	expect(await select()).toEqual({ status: 'refresh-required' });
	expect(request).toHaveBeenCalledTimes(1);
});
it('does not use expired credentials for readback after confirmed PATCH', async () => {
	request.mockResolvedValueOnce(json(body())).mockImplementationOnce(() => {
		jest.setSystemTime(2000000001000);
		return Promise.resolve(new Response(null, { status: 204 }));
	});
	expect(await select()).toEqual({ status: 'incomplete' });
	expect(request).toHaveBeenCalledTimes(2);
});

it('does not start readback or retry after a late PATCH response following timeout', async () => {
	let ready!: () => void;
	const started = new Promise<void>((resolve) => {
		ready = resolve;
	});
	let complete!: (response: Response) => void;
	request.mockResolvedValueOnce(json(body())).mockImplementationOnce(() => {
		ready();
		return new Promise<Response>((resolve) => {
			complete = resolve;
		});
	});
	const result = select();
	await started;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	complete(new Response(null, { status: 204 }));
	await Promise.resolve();
	await Promise.resolve();
	expect(request).toHaveBeenCalledTimes(2);
});
it('treats a readback timeout as incomplete', async () => {
	let ready!: () => void;
	const started = new Promise<void>((resolve) => {
		ready = resolve;
	});
	prepare().mockImplementationOnce(() => {
		ready();
		return new Promise(() => {});
	});
	const result = select();
	await started;
	const signal = request.mock.calls[2][1].signal as AbortSignal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'incomplete' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(3);
});

describe('profile creation', () => {
	const fresh = (count = 0, premium = false) => ({
		...body(),
		profiles: Array.from({ length: count }, (_, i) => ({
			id: `old-${i}`,
			specializationId: i + 1,
			isActive: i === 0,
		})),
		userRoles: premium ? [{ id: 1, name: 'candidate-premium' }] : [],
		subscriptions: [] as unknown[],
	});
	const created = () => ({
		id: target,
		userId: credentials.userId,
		specializationId: 0,
		isActive: true,
	});
	const after = (before = fresh()) => ({
		...before,
		profiles: [...before.profiles.map((profile) => ({ ...profile, isActive: false })), created()],
	});
	const create = () => createOwnProfile(credentials, config);
	const queue = (
		before = fresh(),
		result: unknown = created(),
		readback: unknown = after(before),
	) =>
		request
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(json(result, 201))
			.mockResolvedValueOnce(json(readback));
	it.each([0, 1, 2])(
		'creates for a regular user with %s profiles and confirms ownership and active state',
		async (count) => {
			queue(fresh(count));
			expect(await create()).toEqual({ status: 'success', profileId: target });
			expect(request).toHaveBeenCalledTimes(3);
			expect(request.mock.calls.map(([url]) => url.pathname)).toEqual([
				'/auth/profile',
				'/profiles',
				'/auth/profile',
			]);
			expect(request.mock.calls[1][1]).toMatchObject({
				method: 'POST',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				headers: new Headers({
					Authorization: 'Bearer synthetic-access',
					'Content-Type': 'application/json',
				}),
			});
			expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({
				userId: 'user-a',
				profileType: 1,
				specializationId: 0,
				markingWeight: 1,
			});
		},
	);
	it.each([
		[3, false],
		[4, false],
		[10, true],
		[11, true],
	])('enforces >= limit for count=%s premium=%s', async (count, premium) => {
		request.mockResolvedValueOnce(json(fresh(count, premium)));
		expect(await create()).toEqual({ status: 'limit-reached' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it.each(['role', 'trial'])('allows nine profiles with premium via %s', async (source) => {
		const before = {
			...fresh(9, source === 'role'),
			subscriptions:
				source === 'trial'
					? [
							{
								id: 'trial',
								userId: 'user-a',
								subscriptionId: 4,
								state: 'active',
								createDate: '2026-01-01T00:00:00.000Z',
							},
						]
					: [],
		};
		queue(before);
		expect(await create()).toEqual({ status: 'success', profileId: target });
	});
	it('does not grant premium for an inactive trial', async () => {
		request.mockResolvedValueOnce(
			json({
				...fresh(3),
				subscriptions: [
					{
						id: 'trial',
						userId: 'user-a',
						subscriptionId: 4,
						state: 'inactive',
						createDate: '2026-01-01T00:00:00.000Z',
					},
				],
			}),
		);
		expect(await create()).toEqual({ status: 'limit-reached' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it('blocks a second unfinished profile', async () => {
		request.mockResolvedValueOnce(json({ ...fresh(), profiles: [created()] }));
		expect(await create()).toEqual({ status: 'unfinished-profile-exists' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it.each([
		['accessExpiresAt', 'refresh-required'],
		['sessionDeadline', 'unauthenticated'],
	] as const)('does not use expired %s', async (field, status) => {
		expect(await createOwnProfile({ ...credentials, [field]: 1799999999 }, config)).toEqual({
			status,
		});
		expect(request).not.toHaveBeenCalled();
	});
	it.each([
		[400, 'error'],
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[404, 'error'],
		[500, 'outcome-unknown'],
		[200, 'error'],
	])('handles mutation HTTP %s safely', async (status, result) => {
		request
			.mockResolvedValueOnce(json(fresh()))
			.mockResolvedValueOnce(json({ private: 'not exposed' }, status));
		expect(await create()).toEqual({ status: result });
		expect(request).toHaveBeenCalledTimes(2);
	});
	it.each([
		null,
		{},
		{ id: target },
		{ ...created(), specializationId: 1 },
		{ ...created(), userId: 'foreign' },
		{ ...created(), isActive: false },
		{ ...created(), id: 'invalid' },
	])('does not trust malformed 201 body (%#)', async (result) => {
		queue(fresh(), result);
		expect(await create()).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it.each(['foreign', 'other-active', 'multiple-active', 'missing', 'specialization'])(
		'rejects readback mismatch %s',
		async (kind) => {
			const result = after();
			if (kind === 'foreign') result.id = 'foreign';
			if (kind === 'other-active')
				result.profiles = [
					{ ...created(), isActive: false },
					{ id: other, specializationId: 11, isActive: true },
				];
			if (kind === 'multiple-active')
				result.profiles.push({ id: other, specializationId: 11, isActive: true });
			if (kind === 'missing') result.profiles = [];
			if (kind === 'specialization') result.profiles[0].specializationId = 12;
			queue(fresh(), created(), result);
			expect(await create()).toEqual({ status: 'incomplete' });
			expect(request).toHaveBeenCalledTimes(3);
		},
	);
	it('does not accept an old profile ID as newly created', async () => {
		const before = { ...fresh(), profiles: [{ id: target, specializationId: 11, isActive: true }] };
		queue(before);
		expect(await create()).toEqual({ status: 'incomplete' });
	});
	it.each([401, 403, 500])('reports incomplete when readback fails HTTP %s', async (status) => {
		request
			.mockResolvedValueOnce(json(fresh()))
			.mockResolvedValueOnce(json(created(), 201))
			.mockResolvedValueOnce(json({}, status));
		expect(await create()).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('times out POST after five seconds, aborts and never retries', async () => {
		request
			.mockResolvedValueOnce(json(fresh()))
			.mockImplementationOnce(() => new Promise(() => {}));
		const pending = create();
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
		expect(request.mock.calls[1][1].signal.aborted).toBe(true);
	});
	it('times out readback without repeating POST', async () => {
		request
			.mockResolvedValueOnce(json(fresh()))
			.mockResolvedValueOnce(json(created(), 201))
			.mockImplementationOnce(() => new Promise(() => {}));
		const pending = create();
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('handles network failure without exposing credentials or retrying', async () => {
		request.mockResolvedValueOnce(json(fresh()));
		expect(await create()).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
	});
});

describe('inactive profile deletion', () => {
	const initial = () => ({ ...body(), username: ' Name ' });
	const remaining = () => ({ ...initial(), profiles: [initial().profiles[1]] });
	const remove = (id: unknown = target, username: unknown = ' Name ') =>
		deleteOwnProfile(id, username, credentials, config);
	const queue = (before: unknown = initial(), after: unknown = remaining()) =>
		request
			.mockResolvedValueOnce(json(before))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(json(after));
	it('sends a single authenticated DELETE only after fresh ownership and exact username checks, then reads back', async () => {
		queue();
		expect(await remove()).toEqual({ status: 'success' });
		expect(request).toHaveBeenCalledTimes(3);
		expect(request.mock.calls.map(([url]) => url.pathname)).toEqual([
			'/auth/profile',
			`/profiles/${target}`,
			'/auth/profile',
		]);
		expect(request.mock.calls[1][1]).toMatchObject({
			method: 'DELETE',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: new Headers({ Authorization: 'Bearer synthetic-access' }),
		});
		expect(request.mock.calls[1][1].body).toBeUndefined();
	});
	it.each([
		null,
		undefined,
		1,
		0,
		-1,
		{},
		'',
		target + '/',
		target.replaceAll('-', ''),
		'not-a-uuid',
	])('rejects malformed UUID %# without backend requests', async (id) => {
		// Pass undefined explicitly instead of invoking the helper default.
		expect(await deleteOwnProfile(id, ' Name ', credentials, config)).toEqual({
			status: 'invalid-input',
		});
		expect(request).not.toHaveBeenCalled();
	});
	it.each([null, undefined, 1, {}])(
		'rejects non-string confirmation %# without backend requests',
		async (value) => {
			expect(await deleteOwnProfile(target, value, credentials, config)).toEqual({
				status: 'invalid-input',
			});
			expect(request).not.toHaveBeenCalled();
		},
	);
	it('rejects a valid UUID not owned by this user', async () => {
		request.mockResolvedValueOnce(json(initial()));
		expect(await remove('33333333-3333-4333-8333-333333333333')).toEqual({ status: 'forbidden' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it('rejects the active profile', async () => {
		request.mockResolvedValueOnce(json(initial()));
		expect(await remove(other)).toEqual({ status: 'active-profile' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it('rejects the last remaining profile', async () => {
		request.mockResolvedValueOnce(
			json({ ...initial(), profiles: [{ ...initial().profiles[0], isActive: true }] }),
		);
		expect(await remove()).toEqual({ status: 'last-profile' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it.each(['missing', 'multiple'])('rejects an ambiguous active profile: %s', async (kind) => {
		const data = initial();
		data.profiles = data.profiles.map((profile) => ({ ...profile, isActive: kind === 'multiple' }));
		request.mockResolvedValueOnce(json(data));
		expect(await remove()).toEqual({ status: 'error' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it.each([null, undefined, '', 1])(
		'does not delete when the server username is unavailable %#',
		async (username) => {
			request.mockResolvedValueOnce(json({ ...initial(), username }));
			expect(await remove()).toEqual({ status: 'confirmation-mismatch' });
			expect(request).toHaveBeenCalledTimes(1);
		},
	);
	it.each(['Name', ' name ', ' Name', 'Name ', '  Name  ', ' NAME ', ''])(
		'requires byte-for-byte username equality: %j',
		async (name) => {
			request.mockResolvedValueOnce(json(initial()));
			expect(await remove(target, name)).toEqual({ status: 'confirmation-mismatch' });
			expect(request).toHaveBeenCalledTimes(1);
		},
	);
	it('does not normalize Unicode confirmation', async () => {
		request.mockResolvedValueOnce(json({ ...initial(), username: 'é' }));
		expect(await remove(target, 'e\u0301')).toEqual({ status: 'confirmation-mismatch' });
		expect(request).toHaveBeenCalledTimes(1);
	});
	it.each([
		['accessExpiresAt', 'refresh-required'],
		['sessionDeadline', 'unauthenticated'],
	] as const)('rejects expired %s before requests', async (field, status) => {
		expect(
			await deleteOwnProfile(target, ' Name ', { ...credentials, [field]: 1799999999 }, config),
		).toEqual({ status });
		expect(request).not.toHaveBeenCalled();
	});
	it.each([
		[400, 'invalid-input'],
		[401, 'unauthenticated'],
		[403, 'forbidden'],
		[404, 'forbidden'],
		[500, 'outcome-unknown'],
		[200, 'error'],
	])('handles DELETE HTTP %s safely', async (status, result) => {
		request
			.mockResolvedValueOnce(json(initial()))
			.mockResolvedValueOnce(json({ private: 'not exposed' }, status));
		expect(await remove()).toEqual({ status: result });
		expect(request).toHaveBeenCalledTimes(2);
	});
	it.each([
		'still-present',
		'active-changed',
		'other-disappeared',
		'specialization-changed',
		'no-profiles',
		'foreign-identity',
	])('does not confirm readback mismatch %s', async (kind) => {
		const before = initial();
		const third = {
			id: '33333333-3333-4333-8333-333333333333',
			specializationId: 33,
			isActive: false,
		};
		before.profiles.push(third);
		const after = {
			...before,
			profiles: before.profiles.filter((profile) => profile.id !== target),
		};
		if (kind === 'still-present') after.profiles.push(before.profiles[0]);
		if (kind === 'active-changed')
			after.profiles = after.profiles.map((profile) => ({
				...profile,
				isActive: profile.id === third.id,
			}));
		if (kind === 'other-disappeared')
			after.profiles = after.profiles.filter((profile) => profile.id !== third.id);
		if (kind === 'specialization-changed')
			after.profiles = after.profiles.map((profile) => ({ ...profile, specializationId: 99 }));
		if (kind === 'no-profiles') after.profiles = [];
		if (kind === 'foreign-identity') after.id = 'other-user';
		queue(before, after);
		expect(await remove()).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it.each([401, 403, 500])('returns incomplete after failed readback HTTP %s', async (status) => {
		request
			.mockResolvedValueOnce(json(initial()))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(json({}, status));
		expect(await remove()).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('times out DELETE in five seconds, aborts and does not retry', async () => {
		request
			.mockResolvedValueOnce(json(initial()))
			.mockImplementationOnce(() => new Promise(() => {}));
		const pending = remove();
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
		expect(request.mock.calls[1][1].signal.aborted).toBe(true);
	});
	it('distinguishes readback timeout without repeating DELETE', async () => {
		request
			.mockResolvedValueOnce(json(initial()))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockImplementationOnce(() => new Promise(() => {}));
		const pending = remove();
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('returns unknown after DELETE network failure without retry', async () => {
		request.mockResolvedValueOnce(json(initial()));
		expect(await remove()).toEqual({ status: 'outcome-unknown' });
		expect(request).toHaveBeenCalledTimes(2);
	});
});

describe('shared mutation transport regressions', () => {
	const before = () => ({ ...body(), username: 'Name' });
	const run = (kind: string) =>
		kind === 'select'
			? select()
			: kind === 'create'
				? createOwnProfile(credentials, config)
				: deleteOwnProfile(target, 'Name', credentials, config);
	it.each(['select', 'create', 'delete'])(
		'keeps %s redirects as error without readback or retry',
		async (kind) => {
			request
				.mockResolvedValueOnce(json(before()))
				.mockResolvedValueOnce(new Response(null, { status: 302 }));
			expect(await run(kind)).toEqual({ status: 'error' });
			expect(transport.backendHttp).toHaveBeenCalledWith(
				expect.objectContaining({
					method: kind === 'select' ? 'PATCH' : kind === 'create' ? 'POST' : 'DELETE',
					effect: 'mutation',
					cache: 'no-store',
					timeoutMs: 5000,
				}),
			);
			expect(request).toHaveBeenCalledTimes(2);
		},
	);
	it('reads back after malformed accepted creation JSON without repeating POST', async () => {
		request
			.mockResolvedValueOnce(json(before()))
			.mockResolvedValueOnce(new Response('invalid', { status: 201 }))
			.mockResolvedValueOnce(json(before()));
		expect(await createOwnProfile(credentials, config)).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('keeps accepted creation body timeout incomplete and performs one readback', async () => {
		request
			.mockResolvedValueOnce(json(before()))
			.mockResolvedValueOnce({ status: 201, json: () => new Promise(() => {}) })
			.mockResolvedValueOnce(json(before()));
		const pending = createOwnProfile(credentials, config);
		await jest.advanceTimersByTimeAsync(5000);
		expect(await pending).toEqual({ status: 'incomplete' });
		expect(request).toHaveBeenCalledTimes(3);
		expect(request.mock.calls[1][1].signal.aborted).toBe(true);
	});
});
