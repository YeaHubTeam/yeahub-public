/** @jest-environment node */
import { readOwnProfile } from '@/entities/profile/index.server';
import { readQuestionPersonalState } from '@/entities/question/index.server';

import { currentBackendSession } from '../../_auth/session.server';
import { getOwnQuestionPersonalState } from './reads.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('../../_auth/session.server', () => ({ currentBackendSession: jest.fn() }));
jest.mock('@/entities/profile/index.server', () => ({ readOwnProfile: jest.fn() }));
jest.mock('@/entities/question/index.server', () => ({ readQuestionPersonalState: jest.fn() }));
jest.mock('@/shared/config/index.server', () => ({
	getAuthBackendConfig: () => ({
		apiOrigin: 'https://backend.example',
		allowedOrigins: ['https://backend.example'],
	}),
}));
const session = jest.mocked(currentBackendSession);
const profile = jest.mocked(readOwnProfile);
const question = jest.mocked(readQuestionPersonalState);
const state = { questionId: 7, checksCount: 1, isLearned: false, isFavorite: true };
// Narrow fixtures include only the fields consumed by this composition; API decoder has separate tests.
const own = (id = '11111111-1111-4111-8111-111111111111') =>
	({
		status: 'success',
		profile: { id: 'user-a', isVerified: false, activeProfile: { id } },
	}) as Awaited<ReturnType<typeof readOwnProfile>>;
beforeEach(() => {
	jest.resetAllMocks();
	session.mockResolvedValue({
		status: 'success',
		data: { userId: 'user-a', accessToken: 'synthetic-access' },
	} as Awaited<ReturnType<typeof currentBackendSession>>);
	profile.mockResolvedValue(own());
	question.mockResolvedValue({ status: 'success', state });
});
it.each(['unauthenticated', 'refresh-required', 'error'] as const)(
	'does no backend work for session %s',
	async (status) => {
		session.mockResolvedValue({ status });
		expect(await getOwnQuestionPersonalState(7)).toEqual({ status });
		expect(profile).not.toHaveBeenCalled();
		expect(question).not.toHaveBeenCalled();
	},
);
it('validates input before session access', async () => {
	expect(await getOwnQuestionPersonalState(NaN)).toEqual({ status: 'invalid-input' });
	expect(session).not.toHaveBeenCalled();
});
it.each(['no-active-profile', 'identity-mismatch', 'error'] as const)(
	'does not read question when profile returns %s',
	async (status) => {
		profile.mockResolvedValue({ status });
		expect(await getOwnQuestionPersonalState(7)).toEqual({ status });
		expect(question).not.toHaveBeenCalled();
	},
);
it('uses fresh trusted active profile, rechecks it and drops all credentials/DTOs', async () => {
	const result = await getOwnQuestionPersonalState(7);
	expect(result).toEqual({
		status: 'success',
		userId: 'user-a',
		profileId: '11111111-1111-4111-8111-111111111111',
		isVerified: false,
		state,
	});
	expect(question).toHaveBeenCalledTimes(1);
	expect(question.mock.calls[0][1]).toMatchObject({
		profileId: '11111111-1111-4111-8111-111111111111',
		accessToken: 'synthetic-access',
	});
	expect(profile).toHaveBeenCalledTimes(2);
	expect(profile.mock.invocationCallOrder[0]).toBeLessThan(question.mock.invocationCallOrder[0]);
	expect(question.mock.invocationCallOrder[0]).toBeLessThan(profile.mock.invocationCallOrder[1]);
	expect(JSON.stringify(result)).not.toContain('synthetic-access');
});
it('suppresses a profile switch during the read and uses the new profile on the next call', async () => {
	profile
		.mockResolvedValueOnce(own())
		.mockResolvedValue(own('22222222-2222-4222-8222-222222222222'));
	expect(await getOwnQuestionPersonalState(7)).toEqual({ status: 'identity-mismatch' });
	expect(await getOwnQuestionPersonalState(7)).toMatchObject({
		status: 'success',
		profileId: '22222222-2222-4222-8222-222222222222',
	});
});
it('does not publish state after readback loses the active profile', async () => {
	profile.mockResolvedValueOnce(own()).mockResolvedValueOnce({ status: 'no-active-profile' });
	expect(await getOwnQuestionPersonalState(7)).toEqual({ status: 'no-active-profile' });
});
it('maps backend error and exceptions without exposing them', async () => {
	question.mockResolvedValueOnce({ status: 'forbidden' });
	expect(await getOwnQuestionPersonalState(7)).toEqual({ status: 'forbidden' });
	profile.mockRejectedValueOnce(new Error('secret'));
	expect(await getOwnQuestionPersonalState(7)).toEqual({ status: 'error' });
});

it('integrates the existing profile decoder and real transport with exactly three mock GETs', async () => {
	profile.mockImplementation(jest.requireActual('@/entities/profile/index.server').readOwnProfile);
	question.mockImplementation(
		jest.requireActual('@/entities/question/index.server').readQuestionPersonalState,
	);
	const active = {
		id: '11111111-1111-4111-8111-111111111111',
		specializationId: 1,
		isActive: true,
		profileSkills: [],
	};
	const user = {
		id: 'user-a',
		username: 'Test',
		email: 'test@example.invalid',
		isVerified: false,
		avatarUrl: null,
		birthday: null,
		country: null,
		city: null,
		userRoles: [],
		profiles: [active],
	};
	const fetch = jest
		.spyOn(globalThis, 'fetch')
		.mockRejectedValue(new Error('Network forbidden'))
		.mockResolvedValueOnce(new Response(JSON.stringify(user)))
		.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					id: 7,
					checksCount: 1,
					isLearned: false,
					isFavorite: true,
					accessToken: 'do-not-project',
				}),
			),
		)
		.mockResolvedValueOnce(new Response(JSON.stringify(user)));
	try {
		expect(await getOwnQuestionPersonalState(7)).toEqual({
			status: 'success',
			userId: 'user-a',
			profileId: active.id,
			isVerified: false,
			state,
		});
		expect(fetch).toHaveBeenCalledTimes(3);
		expect(
			fetch.mock.calls.map(([url]) =>
				typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
			),
		).toEqual([
			'https://backend.example/auth/profile',
			`https://backend.example/questions/7?profileId=${active.id}`,
			'https://backend.example/auth/profile',
		]);
		for (const [, options] of fetch.mock.calls) {
			expect(options).toMatchObject({
				method: 'GET',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
			});
			expect(new Headers(options?.headers).get('authorization')).toBe('Bearer synthetic-access');
		}
	} finally {
		fetch.mockRestore();
	}
});
