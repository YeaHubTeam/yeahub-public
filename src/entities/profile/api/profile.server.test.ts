/** @jest-environment node */
import { readOwnProfile } from './profile.server';

jest.mock('server-only', () => ({}), { virtual: true });
const backendConfig = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};

const credentials = { userId: 'user-a', accessToken: 'synthetic-access' };
const response = () => ({
	id: 'user-a',
	username: 'nickname',
	email: 'test@example.invalid',
	isVerified: true,
	avatarUrl: null,
	birthday: null,
	country: 'Country',
	city: null,
	userRoles: [{ id: 1, name: 'candidate', permissions: [{ secret: 'omitted' }] }],
	profiles: [
		{
			id: 'profile-a',
			isActive: true,
			specializationId: 11,
			description: '<p>About</p>',
			socialNetwork: [{ code: 'github', title: 'https://example.invalid' }],
			profileSkills: [{ id: 1, title: 'JS', imageSrc: null }],
		},
	],
	refresh_token: 'synthetic-refresh',
	subscriptions: ['not-needed'],
});
let fetchMock: jest.SpyInstance;
beforeEach(() => {
	fetchMock = jest
		.spyOn(globalThis, 'fetch')
		.mockRejectedValue(new Error('Synthetic network failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (body: unknown, status = 200) =>
	fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));

it('projects only required fields and sends a no-store cookie-free request', async () => {
	reply(response());
	const result = await readOwnProfile(credentials, backendConfig);
	expect(result).toEqual({
		status: 'success',
		profile: {
			id: 'user-a',
			username: 'nickname',
			email: 'test@example.invalid',
			isVerified: true,
			avatarUrl: null,
			birthday: null,
			country: 'Country',
			city: null,
			userRoles: [{ id: 1, name: 'candidate' }],
			activeProfile: {
				id: 'profile-a',
				specializationId: 11,
				description: '<p>About</p>',
				socialNetwork: [{ code: 'github', title: 'https://example.invalid' }],
				profileSkills: [{ id: 1, title: 'JS', imageSrc: null }],
			},
		},
	});
	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(fetchMock).toHaveBeenCalledWith(
		new URL('https://backend.example/auth/profile'),
		expect.objectContaining({
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			headers: { Authorization: 'Bearer synthetic-access' },
		}),
	);
	expect(JSON.stringify(result)).not.toMatch(/synthetic|permissions|subscriptions|refresh_token/);
});
it('handles no active profile explicitly', async () => {
	reply({ ...response(), profiles: [] });
	expect(await readOwnProfile(credentials, backendConfig)).toEqual({ status: 'no-active-profile' });
});
it('rejects another user', async () => {
	reply({ ...response(), id: 'user-b' });
	expect(await readOwnProfile(credentials, backendConfig)).toEqual({ status: 'identity-mismatch' });
});
it.each([401, 403, 500, 302])('handles HTTP %s safely without retries', async (status) => {
	reply({ secret: 'hidden' }, status);
	expect(await readOwnProfile(credentials, backendConfig)).toEqual({
		status: status === 401 ? 'unauthenticated' : 'error',
	});
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('handles a network failure safely', async () => {
	expect(await readOwnProfile(credentials, backendConfig)).toEqual({ status: 'error' });
});
it.each([
	null,
	{},
	{ ...response(), profiles: [{ isActive: 'true' }] },
	{ ...response(), userRoles: [{}] },
	{ ...response(), profiles: [...response().profiles, ...response().profiles] },
])('rejects malformed data', async (body) => {
	reply(body);
	expect(await readOwnProfile(credentials, backendConfig)).toEqual({ status: 'error' });
});
it('bounds a hanging request and aborts it', async () => {
	jest.useFakeTimers();
	fetchMock.mockImplementation(() => new Promise(() => {}));
	const result = readOwnProfile(credentials, backendConfig);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect((fetchMock.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true);
});
