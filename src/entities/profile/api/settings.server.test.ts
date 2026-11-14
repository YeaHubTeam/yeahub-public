/** @jest-environment node */
import { readSettingsSnapshot } from './settings.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = { userId: 'user-a', accessToken: 'synthetic-access' };
const dates = { createDate: '2026-01-01T00:00:00.000Z', endDate: '2026-02-01T00:00:00.000Z' };
const body = () => ({
	id: 'user-a',
	username: 'Backend name',
	userRoles: [{ id: 1, name: 'candidate', permissions: [{ id: 1, name: 'private-permission' }] }],
	email: 'test@example.invalid',
	isVerified: true,
	telegramUsername: 'synthetic',
	profiles: [{ id: 'profile-a', specializationId: 1, isActive: true }],
	subscriptions: [{ id: 'sub-a', userId: 'user-a', subscriptionId: 2, state: 'active', ...dates }],
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
			username: 'Backend name',
			hasPremiumAccess: false,
			canStartTrial: true,
			email: 'test@example.invalid',
			isVerified: true,
			telegramUsername: 'synthetic',
			profiles: body().profiles,
			activeProfileId: 'profile-a',
			subscriptions: [{ id: 'sub-a', subscriptionId: 2, state: 'active', ...dates }],
		},
	});
	expect(fetchSpy).toHaveBeenCalledTimes(1);
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

const trial = (state: string, id = 'trial-a') => ({
	...dates,
	id,
	userId: 'user-a',
	subscriptionId: 4,
	state,
});
it.each([
	{ label: 'ordinary', roles: [{ id: 1, name: 'candidate' }], subscriptions: [], expected: false },
	{
		label: 'premium role',
		roles: [{ id: 2, name: 'candidate-premium' }],
		subscriptions: [],
		expected: true,
	},
	{ label: 'active trial', roles: [], subscriptions: [trial('active')], expected: true },
	{ label: 'inactive trial', roles: [], subscriptions: [trial('inactive')], expected: false },
	{ label: 'canceled trial', roles: [], subscriptions: [trial('canceled')], expected: false },
	{ label: 'pending trial', roles: [], subscriptions: [trial('pending_payment')], expected: false },
	{
		label: 'role and trial',
		roles: [{ id: 2, name: 'candidate-premium' }],
		subscriptions: [trial('active')],
		expected: true,
	},
	{
		label: 'role overrides inactive trial',
		roles: [{ id: 2, name: 'candidate-premium' }],
		subscriptions: [trial('inactive')],
		expected: true,
	},
	{ label: 'active non-trial', roles: [], subscriptions: body().subscriptions, expected: false },
	{
		label: 'role name is exact',
		roles: [{ id: 2, name: 'Candidate-premium' }],
		subscriptions: [],
		expected: false,
	},
	{ label: 'missing roles', roles: undefined, subscriptions: [], expected: false },
	{ label: 'null roles', roles: null, subscriptions: [], expected: false },
	{
		label: 'trial without roles',
		roles: undefined,
		subscriptions: [trial('active')],
		expected: true,
	},
	{
		label: 'first trial inactive (React find semantics)',
		roles: [],
		subscriptions: [trial('inactive'), trial('active', 'trial-b')],
		expected: false,
	},
	{
		label: 'first trial active',
		roles: [],
		subscriptions: [trial('active'), trial('inactive', 'trial-b')],
		expected: true,
	},
])('computes premium on the server: $label', async ({ roles, subscriptions, expected }) => {
	reply({ ...body(), userRoles: roles, subscriptions });
	const result = await readSettingsSnapshot(credentials, config);
	expect(result).toMatchObject({ status: 'success', snapshot: { hasPremiumAccess: expected } });
	expect(result).not.toHaveProperty('snapshot.userRoles');
	expect(result).not.toHaveProperty('snapshot.roles');
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([
	{},
	'candidate-premium',
	true,
	42,
	[null],
	['candidate-premium'],
	[{ name: 'candidate-premium' }],
	[{ id: '2', name: 'candidate-premium' }],
	[{ id: 2, name: 42 }],
	[{ id: 2, name: '' }],
	[{ id: 2, name: 'candidate-premium' }, null],
])('rejects malformed roles %# without granting premium', async (userRoles) => {
	reply({ ...body(), userRoles, subscriptions: [trial('active')] });
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([undefined, null, 42, true, {}, []])(
	'normalizes missing or invalid username %# to null',
	async (username) => {
		reply({ ...body(), username });
		expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
			status: 'success',
			snapshot: { username: null },
		});
	},
);
it.each(['', ' Name ', 'Имя 😀'])('preserves string username %# verbatim', async (username) => {
	reply({ ...body(), username });
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: { username },
	});
});
it('computes account data without profiles and omits unrelated private fields', async () => {
	reply({
		...body(),
		profiles: [],
		userRoles: [{ id: 2, name: 'candidate-premium', permissions: ['private'] }],
		emailVerificationToken: 'hidden',
		cookies: 'hidden',
		passwordHash: 'hidden',
	});
	expect(await readSettingsSnapshot(credentials, config)).toEqual({
		status: 'success',
		snapshot: {
			userId: 'user-a',
			username: 'Backend name',
			hasPremiumAccess: true,
			canStartTrial: false,
			email: 'test@example.invalid',
			isVerified: true,
			telegramUsername: 'synthetic',
			profiles: [],
			activeProfileId: null,
			subscriptions: [{ id: 'sub-a', subscriptionId: 2, state: 'active', ...dates }],
		},
	});
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});

it.each(['active', 'canceled', 'pending_payment', 'inactive'])(
	'projects dates for %s without inferring paid access or renewing expired dates',
	async (state) => {
		reply({ ...body(), subscriptions: [{ ...body().subscriptions[0], state }] });
		expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
			status: 'success',
			snapshot: {
				hasPremiumAccess: false,
				canStartTrial: true,
				subscriptions: [{ state, ...dates }],
			},
		});
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	},
);
it.each([undefined, null])(
	'preserves absent endDate %# as null, including active records',
	async (endDate) => {
		reply({ ...body(), subscriptions: [{ ...body().subscriptions[0], endDate }] });
		expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
			status: 'success',
			snapshot: { subscriptions: [{ createDate: dates.createDate, endDate: null }] },
		});
	},
);
it('normalizes valid ISO offsets and preserves leap days', async () => {
	reply({
		...body(),
		subscriptions: [
			{
				...body().subscriptions[0],
				createDate: '2024-02-29T03:00:00+03:00',
				endDate: '2024-03-29T00:00:00Z',
			},
		],
	});
	expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
		status: 'success',
		snapshot: {
			subscriptions: [
				{ createDate: '2024-02-29T00:00:00.000Z', endDate: '2024-03-29T00:00:00.000Z' },
			],
		},
	});
});
it.each([
	undefined,
	null,
	'',
	0,
	{},
	'2026-01-01',
	'not-a-date',
	'2026-02-30T00:00:00Z',
	'2025-02-29T00:00:00Z',
	'2026-01-01T24:00:00Z',
])('rejects missing or invalid createDate %#', async (createDate) => {
	reply({ ...body(), subscriptions: [{ ...body().subscriptions[0], createDate }] });
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
});
it.each(['', 0, {}, '2026-01-01', 'invalid', '2026-02-30T00:00:00Z'])(
	'rejects invalid supplied endDate %#',
	async (endDate) => {
		reply({ ...body(), subscriptions: [{ ...body().subscriptions[0], endDate }] });
		expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
	},
);
it.each(['active', 'canceled', 'pending_payment', 'inactive'])(
	'never offers trial again when its history contains %s',
	async (state) => {
		reply({ ...body(), subscriptions: [trial(state)] });
		expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
			status: 'success',
			snapshot: { canStartTrial: false, hasPremiumAccess: state === 'active' },
		});
	},
);
it.each([
	{ userRoles: [], subscriptions: [], expected: true },
	{ userRoles: [{ id: 1, name: 'candidate-premium' }], subscriptions: [], expected: false },
	{ userRoles: undefined, subscriptions: [], expected: false },
	{ userRoles: null, subscriptions: [], expected: false },
])(
	'requires confirmed role/history data for trial availability %#',
	async ({ expected, ...data }) => {
		reply({ ...body(), ...data });
		expect(await readSettingsSnapshot(credentials, config)).toMatchObject({
			status: 'success',
			snapshot: { canStartTrial: expected },
		});
	},
);
it.each([
	{ userRoles: [{}] },
	{ subscriptions: undefined },
	{ subscriptions: [{}] },
	{ subscriptions: [{ ...trial('inactive'), subscriptionId: '4' }] },
	{ subscriptions: [{ ...trial('inactive'), subscriptionId: 0 }] },
	{ subscriptions: [{ ...trial('inactive'), subscriptionId: -4 }] },
])('rejects invalid trial inputs without granting availability %#', async (data) => {
	reply({ ...body(), ...data });
	expect(await readSettingsSnapshot(credentials, config)).toEqual({ status: 'error' });
});
