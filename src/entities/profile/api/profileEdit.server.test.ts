/** @jest-environment node */
import { parseProfileEditInput, saveOwnProfile } from './profileEdit.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = () => ({
	userId: 'user-a',
	accessToken: 'synthetic-access',
	expiresAt: Math.floor(Date.now() / 1000) + 3600,
});
const input = () => ({
	username: ' new name ',
	city: '',
	socialNetwork: [{ code: 'github', title: 'https://example.invalid' }],
	description: '<p>New</p>',
	profileSkills: [2, 1],
});
const current = (description = 'Existing') => ({
	id: 'user-a',
	username: 'Old',
	email: 'test@example.invalid',
	isVerified: false,
	avatarUrl: null,
	birthday: null,
	country: null,
	city: null,
	userRoles: [],
	profiles: [
		{
			id: 'profile-a',
			isActive: true,
			specializationId: 1,
			description,
			profileSkills: [],
			socialNetwork: [],
		},
	],
});
const put = (value = input()) => ({
	id: 'profile-a',
	profileSkills: value.profileSkills.map((id) => ({ id })),
	socialNetwork: value.socialNetwork,
	description: value.description,
});
let fetchMock: jest.SpyInstance;
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const prepare = (description?: string) => {
	fetchMock
		.mockResolvedValueOnce(response(current(description)))
		.mockResolvedValueOnce(response(put()))
		.mockResolvedValueOnce(response({ id: 'user-a', username: input().username, city: '' }));
};
beforeEach(() => {
	fetchMock = jest
		.spyOn(globalThis, 'fetch')
		.mockRejectedValue(new Error('Private network details'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});

it('saves exact allowlisted payloads, full skills, and unchanged strings without credentials in result', async () => {
	prepare();
	expect(await saveOwnProfile(input(), credentials(), config)).toEqual({ status: 'success' });
	expect(fetchMock).toHaveBeenCalledTimes(3);
	const calls = fetchMock.mock.calls as [URL, RequestInit][];
	expect(calls.map(([url]) => url.pathname)).toEqual([
		'/auth/profile',
		'/profiles/profile-a',
		'/users/user-a',
	]);
	expect(JSON.parse(calls[1][1].body as string)).toEqual({
		socialNetwork: input().socialNetwork,
		profileSkills: [2, 1],
		description: '<p>New</p>',
	});
	expect(JSON.parse(calls[2][1].body as string)).toEqual({ username: ' new name ', city: '' });
	for (const [, options] of calls)
		expect(options).toMatchObject({
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: expect.objectContaining({ Authorization: 'Bearer synthetic-access' }),
		});
});

it.each([
	null,
	[],
	{},
	{ ...input(), username: '' },
	{ ...input(), username: 'x' },
	{ ...input(), username: 'x'.repeat(31) },
	{ ...input(), city: 1 },
	{ ...input(), description: null },
	{ ...input(), description: undefined },
	{ ...input(), description: {} },
	{ ...input(), description: [] },
	{ ...input(), description: 1 },
	{ ...input(), socialNetwork: [{ code: 'unknown', title: 'x' }] },
	{ ...input(), socialNetwork: [{ code: 'github', title: 1 }] },
	{ ...input(), socialNetwork: [{ code: 'github', title: 'x', secret: 'x' }] },
	{
		...input(),
		socialNetwork: [
			{ code: 'github', title: 'x' },
			{ code: 'github', title: 'y' },
		],
	},
	{ ...input(), profileSkills: undefined },
	{ ...input(), profileSkills: [1, 1] },
	{ ...input(), profileSkills: [0] },
	{ ...input(), profileSkills: [-1] },
	{ ...input(), profileSkills: [1.1] },
	{ ...input(), profileSkills: ['1'] },
	{ ...input(), profileSkills: [Number.MAX_SAFE_INTEGER + 1] },
	...[
		'userId',
		'profileId',
		'avatarImage',
		'avatarUrl',
		'email',
		'specializationId',
		'profileType',
		'accessToken',
	].map((key) => ({ ...input(), [key]: 'untrusted' })),
])('rejects invalid input before any backend request (%#)', async (value) => {
	expect(await saveOwnProfile(value, credentials(), config)).toEqual({
		status: 'validation-error',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});

it.each(['a'.repeat(65_536), 'я'.repeat(32_768), '😀'.repeat(16_384)])(
	'accepts exactly 65536 UTF-8 bytes (%#)',
	async (description) => {
		const value = { ...input(), description };
		prepare();
		fetchMock
			.mockReset()
			.mockResolvedValueOnce(response(current()))
			.mockResolvedValueOnce(response(put(value)))
			.mockResolvedValueOnce(response({ id: 'user-a', username: value.username, city: '' }));
		expect(Buffer.byteLength(description, 'utf8')).toBe(65_536);
		expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
		expect(JSON.parse(fetchMock.mock.calls[1][1].body).description).toBe(description);
	},
);
it.each(['a'.repeat(65_537), 'я'.repeat(32_768) + 'a', '😀'.repeat(16_384) + 'a'])(
	'rejects 65537 bytes without PUT/PATCH (%#)',
	async (description) => {
		expect(Buffer.byteLength(description, 'utf8')).toBe(65_537);
		expect(await saveOwnProfile({ ...input(), description }, credentials(), config)).toEqual({
			status: 'validation-error',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	},
);
it('preserves an existing oversized description by omitting it, while still sending the full skills array', async () => {
	const { description: omitted, ...value } = input();
	expect(omitted).toBeDefined();
	fetchMock
		.mockResolvedValueOnce(response(current('я'.repeat(65_536))))
		.mockResolvedValueOnce(response({ ...put(), description: 'я'.repeat(65_536) }))
		.mockResolvedValueOnce(response({ id: 'user-a', username: value.username, city: '' }));
	expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
	expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
		socialNetwork: value.socialNetwork,
		profileSkills: [2, 1],
	});
});
it('allows explicit description clearing and explicit removal of every skill', async () => {
	const value = { ...input(), description: '', profileSkills: [] };
	fetchMock
		.mockResolvedValueOnce(response(current()))
		.mockResolvedValueOnce(response(put(value)))
		.mockResolvedValueOnce(response({ id: 'user-a', username: value.username, city: '' }));
	expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
	expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
		description: '',
		profileSkills: [],
	});
});
it('does not accept inherited required fields or inherited description', () => {
	expect(parseProfileEditInput(Object.create(input()))).toBeNull();
	const { description: omitted, ...value } = input();
	expect(omitted).toBeDefined();
	const inherited = Object.assign(Object.create({ description: 'inherited' }), value);
	expect(parseProfileEditInput(inherited)).toEqual(value);
});
it.each([401, 403, 500, 302])('stops after PUT status %s', async (status) => {
	fetchMock.mockResolvedValueOnce(response(current())).mockResolvedValueOnce(response({}, status));
	expect(await saveOwnProfile(input(), credentials(), config)).toEqual({
		status: status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : 'error',
	});
	expect(fetchMock).toHaveBeenCalledTimes(2);
});
it.each([401, 403, 500])(
	'reports partial success after PATCH status %s without retries',
	async (status) => {
		fetchMock
			.mockResolvedValueOnce(response(current()))
			.mockResolvedValueOnce(response(put()))
			.mockResolvedValueOnce(response({}, status));
		expect(await saveOwnProfile(input(), credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'confirmed',
			user: 'unconfirmed',
			reason: status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(3);
	},
);
it.each(['network', 'invalid-json', 'wrong-id', 'missing-skill', 'duplicate-skill'])(
	'does not PATCH after an unconfirmed PUT: %s',
	async (outcome) => {
		fetchMock.mockResolvedValueOnce(response(current()));
		if (outcome === 'invalid-json')
			fetchMock.mockResolvedValueOnce(new Response('invalid', { status: 200 }));
		else if (outcome !== 'network')
			fetchMock.mockResolvedValueOnce(
				response({
					...put(),
					...(outcome === 'wrong-id'
						? { id: 'other' }
						: { profileSkills: outcome === 'missing-skill' ? [] : [{ id: 1 }, { id: 1 }] }),
				}),
			);
		expect(await saveOwnProfile(input(), credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'unconfirmed',
			user: 'not-attempted',
			reason: 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	},
);
it.each(['PUT', 'PATCH'])('bounds %s timeout and does not retry', async (method) => {
	jest.useFakeTimers();
	fetchMock.mockResolvedValueOnce(response(current()));
	if (method === 'PATCH') fetchMock.mockResolvedValueOnce(response(put()));
	fetchMock.mockImplementationOnce(() => new Promise(() => {}));
	const pending = saveOwnProfile(input(), credentials(), config);
	await jest.advanceTimersByTimeAsync(5001);
	expect(await pending).toMatchObject({
		status: 'partial-success',
		profile: method === 'PUT' ? 'unconfirmed' : 'confirmed',
	});
	expect(fetchMock).toHaveBeenCalledTimes(method === 'PUT' ? 2 : 3);
	expect(fetchMock.mock.calls.at(-1)[1].signal.aborted).toBe(true);
	expect(jest.getTimerCount()).toBe(0);
});
it.each(['no-active', 'wrong-user', 'invalid', 'network'])(
	'refuses invalid initial profile: %s',
	async (outcome) => {
		if (outcome !== 'network')
			fetchMock.mockResolvedValueOnce(
				response(
					outcome === 'invalid'
						? {}
						: { ...current(), ...(outcome === 'wrong-user' ? { id: 'other' } : { profiles: [] }) },
				),
			);
		expect(await saveOwnProfile(input(), credentials(), config)).toMatchObject({
			status: outcome === 'wrong-user' ? 'unauthorized' : 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	},
);
it('rejects expired authorization and disallowed backend origin without requests', async () => {
	expect(await saveOwnProfile(input(), { ...credentials(), expiresAt: 0 }, config)).toEqual({
		status: 'unauthorized',
	});
	expect(await saveOwnProfile(input(), credentials(), { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(fetchMock).not.toHaveBeenCalled();
});

it.each([401, 403, 500, 302])(
	'handles initial profile HTTP %s without mutations',
	async (status) => {
		fetchMock.mockResolvedValueOnce(response({}, status));
		expect(await saveOwnProfile(input(), credentials(), config)).toEqual({
			status: status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	},
);
it('rejects multiple active profiles without a PUT', async () => {
	const value = current();
	value.profiles.push({ ...value.profiles[0], id: 'second' });
	fetchMock.mockResolvedValueOnce(response(value));
	expect(await saveOwnProfile(input(), credentials(), config)).toEqual({ status: 'error' });
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each(['load', 'put'])('checks authorization deadline after %s', async (stage) => {
	jest.useFakeTimers();
	const auth = credentials();
	const expire = () => {
		jest.setSystemTime((auth.expiresAt + 1) * 1000);
	};
	if (stage === 'load')
		fetchMock.mockImplementationOnce(() => {
			expire();
			return Promise.resolve(response(current()));
		});
	else
		fetchMock.mockResolvedValueOnce(response(current())).mockImplementationOnce(() => {
			expire();
			return Promise.resolve(response(put()));
		});
	expect(await saveOwnProfile(input(), auth, config)).toEqual(
		stage === 'load'
			? { status: 'unauthorized' }
			: {
					status: 'partial-success',
					profile: 'confirmed',
					user: 'not-attempted',
					reason: 'unauthorized',
				},
	);
	expect(fetchMock).toHaveBeenCalledTimes(stage === 'load' ? 1 : 2);
});
it('does not start PATCH even when a timed-out PUT eventually completes', async () => {
	jest.useFakeTimers();
	let finish: (value: Response) => void = () => {
		throw new Error('Request was not started');
	};
	fetchMock.mockResolvedValueOnce(response(current())).mockImplementationOnce(
		() =>
			new Promise<Response>((resolve) => {
				finish = resolve;
			}),
	);
	const pending = saveOwnProfile(input(), credentials(), config);
	await jest.advanceTimersByTimeAsync(5001);
	expect(await pending).toMatchObject({ status: 'partial-success', user: 'not-attempted' });
	finish(response(put()));
	await jest.advanceTimersByTimeAsync(1);
	expect(fetchMock).toHaveBeenCalledTimes(2);
});
it.each(['network', 'invalid-json', 'wrong-user'])(
	'reports an unconfirmed PATCH outcome: %s',
	async (outcome) => {
		fetchMock.mockResolvedValueOnce(response(current())).mockResolvedValueOnce(response(put()));
		if (outcome === 'invalid-json') fetchMock.mockResolvedValueOnce(new Response('invalid'));
		if (outcome === 'wrong-user')
			fetchMock.mockResolvedValueOnce(
				response({ id: 'other', username: input().username, city: '' }),
			);
		expect(await saveOwnProfile(input(), credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'confirmed',
			user: 'unconfirmed',
			reason: 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(3);
	},
);
it('uses structural comparison for social responses and accepts a null city', async () => {
	const value = { ...input(), city: null };
	fetchMock
		.mockResolvedValueOnce(response(current()))
		.mockResolvedValueOnce(
			response({
				...put(),
				socialNetwork: [{ title: value.socialNetwork[0].title, code: 'github' }],
			}),
		)
		.mockResolvedValueOnce(response({ id: 'user-a', username: value.username, city: null }));
	expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
});

it('rejects sparse skill arrays instead of serializing missing elements as null', async () => {
	const skills = Array<number>(2);
	skills[1] = 2;
	expect(
		await saveOwnProfile({ ...input(), profileSkills: skills }, credentials(), config),
	).toEqual({ status: 'validation-error' });
	expect(fetchMock).not.toHaveBeenCalled();
});

describe('immutable unknown social records from the verified active profile', () => {
	const unknown = { code: 'legacy-network', title: 'unchanged legacy value' };
	const second = { code: 'another-network', title: '' };
	const prepareLinks = (
		existing: unknown,
		socialNetwork = input().socialNetwork,
		expected: unknown = socialNetwork,
	) => {
		const loaded = current();
		fetchMock
			.mockResolvedValueOnce(
				response({ ...loaded, profiles: [{ ...loaded.profiles[0], socialNetwork: existing }] }),
			)
			.mockResolvedValueOnce(response({ ...put(), socialNetwork: expected }))
			.mockResolvedValueOnce(response({ id: 'user-a', username: input().username, city: '' }));
		return { ...input(), socialNetwork };
	};
	it.each([[], [unknown], [unknown, second]].map((value) => [value]))(
		'preserves existing unknown records in their order (%#)',
		async (existing) => {
			const expected = [...input().socialNetwork, ...existing];
			const value = prepareLinks(existing, input().socialNetwork, expected);
			expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
			expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
				socialNetwork: expected,
				profileSkills: [2, 1],
			});
			expect(fetchMock.mock.calls.map(([url]) => (url as URL).pathname)).toEqual([
				'/auth/profile',
				'/profiles/profile-a',
				'/users/user-a',
			]);
		},
	);
	it('updates known records, removes omitted known records and strips extra backend properties', async () => {
		const existing = [
			{ code: 'github', title: 'old github' },
			{ code: 'telegram', title: 'remove me' },
			{ ...unknown, internal: { secret: 'never forward' } },
		];
		const expected = [...input().socialNetwork, unknown];
		expect(
			await saveOwnProfile(
				prepareLinks(existing, input().socialNetwork, expected),
				credentials(),
				config,
			),
		).toEqual({ status: 'success' });
		expect(JSON.parse(fetchMock.mock.calls[1][1].body).socialNetwork).toEqual(expected);
		expect(fetchMock.mock.calls[1][1].body).not.toContain('internal');
	});
	it('an empty client list removes known records but retains unknown records', async () => {
		const expected = [unknown, second];
		const value = prepareLinks([{ code: 'github', title: 'old' }, ...expected], [], expected);
		expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'success' });
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
			socialNetwork: expected,
			profileSkills: [2, 1],
		});
	});
	it.each(
		[
			[unknown],
			[{ ...unknown, title: 'client tampering' }],
			[unknown, unknown],
			[{ code: 'new-unknown', title: 'new' }],
			[
				{ code: 'github', title: 'a' },
				{ code: 'github', title: 'b' },
			],
			[{ code: 'github', title: 'a', internal: 'client extra' }],
		].map((value) => [value]),
	)(
		'rejects client unknown records, tampering, duplicates or extra fields before requests (%#)',
		async (socialNetwork) => {
			expect(await saveOwnProfile({ ...input(), socialNetwork }, credentials(), config)).toEqual({
				status: 'validation-error',
			});
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);
	it.each(
		[
			[unknown, unknown],
			[
				{ code: 'github', title: 'a' },
				{ code: 'github', title: 'b' },
			],
			[{ code: 'legacy', title: 123 }],
			[{ code: '', title: 'value' }],
			{ code: 'legacy', title: 'value' },
		].map((value) => [value]),
	)('refuses malformed or ambiguous server records before PUT/PATCH (%#)', async (existing) => {
		const value = prepareLinks(existing);
		expect(await saveOwnProfile(value, credentials(), config)).toEqual({ status: 'error' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it('checks the merged response, not only the client records', async () => {
		const value = prepareLinks([unknown]);
		expect(await saveOwnProfile(value, credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'unconfirmed',
			user: 'not-attempted',
			reason: 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

describe('initial specialization assignment', () => {
	const assignment = () => ({ ...input(), expectedProfileId: 'profile-a', specializationId: 11 });
	const initial = () => {
		const data = current();
		data.profiles[0].specializationId = 0;
		return data;
	};
	const saved = () => ({
		...current(),
		username: input().username,
		city: '',
		profiles: [{ ...initial().profiles[0], ...put(), specializationId: 11 }],
	});
	const queue = (readback: unknown = saved()) =>
		fetchMock
			.mockResolvedValueOnce(response(initial()))
			.mockResolvedValueOnce(response({ ...put(), specializationId: 11 }))
			.mockResolvedValueOnce(response({ id: 'user-a', username: input().username, city: '' }))
			.mockResolvedValueOnce(response(readback));
	it('assigns 0 to ID using the complete PUT and confirms all values by readback', async () => {
		queue();
		expect(await saveOwnProfile(assignment(), credentials(), config)).toEqual({
			status: 'success',
		});
		expect(fetchMock).toHaveBeenCalledTimes(4);
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
			socialNetwork: input().socialNetwork,
			description: input().description,
			profileSkills: [2, 1],
			specializationId: 11,
		});
		expect(fetchMock.mock.calls[3][0].pathname).toBe('/auth/profile');
	});
	it.each([0, -1, 1.5, '11', undefined])(
		'rejects invalid assignment %j before transport',
		async (specializationId) => {
			expect(
				await saveOwnProfile({ ...assignment(), specializationId }, credentials(), config),
			).toEqual({ status: 'validation-error' });
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);
	it('requires the original profile ID', async () => {
		const { expectedProfileId, ...data } = assignment();
		expect(expectedProfileId).toBe('profile-a');
		expect(await saveOwnProfile(data, credentials(), config)).toEqual({
			status: 'validation-error',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});
	it('rejects changing an established specialization', async () => {
		fetchMock.mockResolvedValueOnce(response(current()));
		expect(await saveOwnProfile(assignment(), credentials(), config)).toEqual({
			status: 'validation-error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it('rejects a switched or foreign profile before PUT', async () => {
		fetchMock.mockResolvedValueOnce(response(initial()));
		expect(
			await saveOwnProfile(
				{ ...assignment(), expectedProfileId: 'old-profile' },
				credentials(),
				config,
			),
		).toEqual({ status: 'forbidden' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it('rejects no active profile', async () => {
		const data = initial();
		data.profiles[0].isActive = false;
		fetchMock.mockResolvedValueOnce(response(data));
		expect(await saveOwnProfile(assignment(), credentials(), config)).toEqual({ status: 'error' });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it.each([
		'identity',
		'active',
		'profile',
		'specialization',
		'skills',
		'description',
		'social',
		'username',
		'city',
	])('does not confirm mismatched readback: %s', async (field) => {
		const data = saved();
		switch (field) {
			case 'identity':
				data.id = 'other';
				break;
			case 'active':
				data.profiles[0].isActive = false;
				break;
			case 'profile':
				data.profiles[0].id = 'other';
				break;
			case 'specialization':
				data.profiles[0].specializationId = 0;
				break;
			case 'skills':
				data.profiles[0].profileSkills = [];
				break;
			case 'description':
				data.profiles[0].description = 'Old';
				break;
			case 'social':
				data.profiles[0].socialNetwork = [];
				break;
			case 'username':
				data.username = 'Old';
				break;
			case 'city':
				data.city = 'Old';
				break;
		}
		queue(data);
		expect(await saveOwnProfile(assignment(), credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'unconfirmed',
			user: 'unconfirmed',
			reason: 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});
	it('preserves unknown social records and omitted description', async () => {
		const original = initial();
		original.profiles[0].socialNetwork = [{ code: 'legacy', title: 'Preserved' }] as never;
		const socialNetwork = [...input().socialNetwork, ...original.profiles[0].socialNetwork];
		const final = saved();
		final.profiles[0].description = 'Existing';
		final.profiles[0].socialNetwork = socialNetwork;
		const { description, ...data } = assignment();
		expect(description).toBeDefined();
		fetchMock
			.mockResolvedValueOnce(response(original))
			.mockResolvedValueOnce(response({ ...put(), socialNetwork, description: 'Existing' }))
			.mockResolvedValueOnce(response({ id: 'user-a', username: data.username, city: '' }))
			.mockResolvedValueOnce(response(final));
		expect(await saveOwnProfile(data, credentials(), config)).toEqual({ status: 'success' });
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
			specializationId: 11,
			profileSkills: [2, 1],
			socialNetwork,
		});
	});
	it('does not retry a failed readback', async () => {
		queue();
		fetchMock.mockReset();
		fetchMock
			.mockResolvedValueOnce(response(initial()))
			.mockResolvedValueOnce(response(put()))
			.mockResolvedValueOnce(response({ id: 'user-a', username: input().username, city: '' }))
			.mockRejectedValueOnce(new Error('Private timeout'));
		expect(await saveOwnProfile(assignment(), credentials(), config)).toEqual({
			status: 'partial-success',
			profile: 'unconfirmed',
			user: 'unconfirmed',
			reason: 'error',
		});
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});
});
