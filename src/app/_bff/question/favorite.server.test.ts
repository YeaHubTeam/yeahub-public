/** @jest-environment node */
import { readOwnProfile } from '@/entities/profile/index.server';

import { currentBackendSession } from '../../_auth/session.server';
import { setOwnQuestionFavorite } from './favorite.server';
import { getOwnQuestionPersonalState } from './reads.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('../../_auth/session.server', () => ({ currentBackendSession: jest.fn() }));
jest.mock('@/entities/profile/index.server', () => ({ readOwnProfile: jest.fn() }));
jest.mock('./reads.server', () => ({ getOwnQuestionPersonalState: jest.fn() }));
jest.mock('@/shared/config/index.server', () => ({
	getAuthBackendConfig: () => ({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
	}),
}));
const profileId = '11111111-1111-4111-8111-111111111111';
const input = { questionId: 7, expectedProfileId: profileId, favorite: true };
const session = jest.mocked(currentBackendSession);
const profile = jest.mocked(readOwnProfile);
const readback = jest.mocked(getOwnQuestionPersonalState);
const confirmed = (favorite = true) => ({
	status: 'success' as const,
	userId: 'user-a',
	profileId,
	isVerified: true,
	state: { questionId: 7, checksCount: 2, isLearned: false, isFavorite: favorite },
});
let request: jest.SpyInstance;
beforeEach(() => {
	jest.resetAllMocks();
	request = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 201 }));
	session.mockResolvedValue({
		status: 'success',
		data: { userId: 'user-a', accessToken: 'synthetic-access' },
	} as Awaited<ReturnType<typeof currentBackendSession>>);
	profile.mockResolvedValue({
		status: 'success',
		profile: { isVerified: true, activeProfile: { id: profileId } },
	} as Awaited<ReturnType<typeof readOwnProfile>>);
	readback.mockResolvedValue(confirmed());
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
it.each([
	[true, 'POST', 201],
	[false, 'DELETE', 204],
] as const)(
	'sets favorite=%s with one exact mutation and confirmed readback',
	async (favorite, method, status) => {
		request.mockResolvedValue(new Response(null, { status }));
		readback.mockResolvedValue(confirmed(favorite));
		const result = await setOwnQuestionFavorite({ ...input, favorite });
		expect(result).toEqual(confirmed(favorite));
		expect(request).toHaveBeenCalledTimes(1);
		const [url, init] = request.mock.calls[0];
		expect(String(url)).toBe(`https://backend.example/questions/favorites/${profileId}/7`);
		expect(init).toMatchObject({
			method,
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
		});
		expect(init.body).toBeUndefined();
		expect([...new Headers(init.headers)]).toEqual([['authorization', 'Bearer synthetic-access']]);
		expect(profile.mock.invocationCallOrder[0]).toBeLessThan(request.mock.invocationCallOrder[0]);
		expect(request.mock.invocationCallOrder[0]).toBeLessThan(readback.mock.invocationCallOrder[0]);
		expect(JSON.stringify(result)).not.toContain('synthetic-access');
	},
);
it('guest does not dispatch', async () => {
	session.mockResolvedValue({ status: 'unauthenticated' });
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'unauthenticated' });
	expect(request).not.toHaveBeenCalled();
});
it('unverified email and foreign/stale profile cannot dispatch', async () => {
	expect(await setOwnQuestionFavorite({ ...input, expectedProfileId: 'another-profile' })).toEqual({
		status: 'identity-mismatch',
	});
	profile.mockResolvedValue({
		status: 'success',
		profile: { isVerified: false, activeProfile: { id: profileId } },
	} as Awaited<ReturnType<typeof readOwnProfile>>);
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'unverified' });
	expect(request).not.toHaveBeenCalled();
});
it.each([200, 400, 401, 403, 404, 409, 429, 500, 302])(
	'does not claim success for HTTP %s or retry',
	async (status) => {
		request.mockResolvedValue(new Response(null, { status }));
		expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'error' });
		expect(request).toHaveBeenCalledTimes(1);
		expect(readback).not.toHaveBeenCalled();
	},
);
it('network/timeout never retries', async () => {
	request.mockRejectedValueOnce(new Error('offline'));
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'error' });
	jest.useFakeTimers();
	request.mockImplementationOnce(() => new Promise(() => {}));
	const pending = setOwnQuestionFavorite(input);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(2);
});
it('rejects changed identity/profile and unconfirmed favorite after mutation', async () => {
	readback
		.mockResolvedValueOnce({ ...confirmed(), userId: 'user-b' })
		.mockResolvedValueOnce({ ...confirmed(), profileId: 'another' })
		.mockResolvedValueOnce(confirmed(false));
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'identity-mismatch' });
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'identity-mismatch' });
	expect(await setOwnQuestionFavorite(input)).toEqual({ status: 'error' });
});
