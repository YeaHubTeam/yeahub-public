/** @jest-environment node */
import { getOwnProfile, mutateOwnProfile } from '@/auth';
import type { ProfileEditInput, ProfileEditResult } from '@/entities/profile';

import { readSavedProfile, saveProfile } from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/auth', () => ({ mutateOwnProfile: jest.fn(), getOwnProfile: jest.fn() }));
const value: ProfileEditInput = {
	username: 'Name',
	city: null,
	socialNetwork: [],
	profileSkills: [],
};
it.each<ProfileEditResult>([
	{ status: 'success' },
	{ status: 'validation-error' },
	{ status: 'unauthorized' },
	{ status: 'forbidden' },
	{ status: 'error' },
	{ status: 'sync-required' },
	{ status: 'partial-success', profile: 'confirmed', user: 'unconfirmed', reason: 'error' },
])('forwards safe server outcomes without retry (%#)', async (result) => {
	jest.mocked(mutateOwnProfile).mockResolvedValue(result);
	expect(await saveProfile(value)).toEqual(result);
	expect(mutateOwnProfile).toHaveBeenCalledTimes(1);
	expect(mutateOwnProfile).toHaveBeenCalledWith(value);
});
it('hides unexpected exceptions', async () => {
	jest.mocked(mutateOwnProfile).mockRejectedValue(new Error('Private backend details'));
	expect(await saveProfile(value)).toEqual({ status: 'error' });
});

const loaded = () => ({
	status: 'success' as const,
	profile: {
		id: 'server-user',
		username: ' Name ',
		city: null,
		email: 'private@example.invalid',
		birthday: '2000-01-01',
		avatarUrl: 'private-avatar',
		country: 'Country',
		isVerified: true,
		userRoles: [{ id: 1, name: 'user' }],
		activeProfile: {
			id: 'server-profile',
			specializationId: 3,
			description: '<p>Raw HTML</p>',
			socialNetwork: [
				{ code: 'github', title: 'Profile', access_token: 'private-link-token' },
				{ code: 'legacy', title: 'Private legacy record' },
				{ code: 'vk', title: 'Not exposed by the editor' },
			],
			profileSkills: [
				{ id: 999, title: 'Outside catalogue', imageSrc: null },
				{ id: 1, title: 'React', imageSrc: null },
			],
		},
		access_token: 'private-access-token',
		refresh_token: 'private-refresh-token',
		cookies: 'private-cookies',
	},
});
// Malformed loader outcomes are intentional: verify the Server Action boundary fails closed.
const mockRead = (result: unknown) =>
	jest.mocked(getOwnProfile).mockResolvedValue(result as Awaited<ReturnType<typeof getOwnProfile>>);

describe('readSavedProfile', () => {
	it('reads once without arguments and exposes only the exact minimal saved projection', async () => {
		mockRead(loaded());
		expect(readSavedProfile).toHaveLength(0);
		expect(await readSavedProfile()).toEqual({
			status: 'success',
			profile: {
				id: 'server-user',
				profileId: 'server-profile',
				username: ' Name ',
				city: null,
				description: '<p>Raw HTML</p>',
				socialNetwork: [{ code: 'github', title: 'Profile' }],
				profileSkills: [999, 1],
			},
		});
		expect(getOwnProfile).toHaveBeenCalledTimes(1);
		expect(getOwnProfile).toHaveBeenCalledWith();
		expect(mutateOwnProfile).not.toHaveBeenCalled();
	});
	it('ignores runtime arguments rather than trusting a supplied user identity', async () => {
		mockRead(loaded());
		const result = await Reflect.apply(readSavedProfile, undefined, [{ userId: 'other-user' }]);
		expect(result.profile.id).toBe('server-user');
		expect(getOwnProfile).toHaveBeenCalledWith();
	});
	it.each([null, '', 'City'])('preserves city exactly: %j', async (city) => {
		const data = loaded();
		mockRead({ ...data, profile: { ...data.profile, city } });
		const result = await readSavedProfile();
		expect(result.status === 'success' && result.profile.city).toBe(city);
	});
	it.each([null, '', '<p>  Unicode: Привет 🌍 </p>', 'x'.repeat(65_537)])(
		'preserves null, empty and raw persisted description (%#)',
		async (description) => {
			const data = {
				...loaded(),
				profile: {
					...loaded().profile,
					activeProfile: { ...loaded().profile.activeProfile, description },
				},
			};
			mockRead(data);
			const result = await readSavedProfile();
			expect(result.status === 'success' && result.profile.description).toBe(description);
		},
	);
	it('returns every selected ID without a catalogue limit and allows empty lists', async () => {
		const data = loaded();
		data.profile.activeProfile.profileSkills = Array.from({ length: 101 }, (_, i) => ({
			id: i + 1,
			title: 'Skill',
			imageSrc: null,
		}));
		mockRead(data);
		let result = await readSavedProfile();
		expect(result.status === 'success' && result.profile.profileSkills).toHaveLength(101);
		data.profile.activeProfile.profileSkills = [];
		data.profile.activeProfile.socialNetwork = [];
		result = await readSavedProfile();
		expect(result.status === 'success' && result.profile.profileSkills).toEqual([]);
	});
	it('returns all nine editable social codes, stripping extra properties and preserving empty titles', async () => {
		const data = loaded();
		const codes = [
			'instagram',
			'linkedin',
			'twitter',
			'facebook',
			'github',
			'behance',
			'whatsapp',
			'telegram',
			'youtube',
		];
		mockRead({
			...data,
			profile: {
				...data.profile,
				activeProfile: {
					...data.profile.activeProfile,
					socialNetwork: codes.map((code) => ({ code, title: '', extra: 'private' })),
				},
			},
		});
		const result = await readSavedProfile();
		expect(result.status === 'success' && result.profile.socialNetwork).toEqual(
			codes.map((code) => ({ code, title: '' })),
		);
	});
	it.each([
		['unauthenticated', 'unauthorized'],
		['refresh-required', 'refresh-required'],
		['no-active-profile', 'error'],
		['identity-mismatch', 'error'],
		['error', 'error'],
		['unexpected', 'error'],
	])('maps %s to %s without leaking other loader data', async (status, expected) => {
		mockRead({ status, credentials: 'private' });
		expect(await readSavedProfile()).toEqual({ status: expected });
		expect(mutateOwnProfile).not.toHaveBeenCalled();
	});
	it('hides rejected reads', async () => {
		jest.mocked(getOwnProfile).mockRejectedValue(new Error('Private response'));
		expect(await readSavedProfile()).toEqual({ status: 'error' });
		expect(mutateOwnProfile).not.toHaveBeenCalled();
	});
	it.each([null, {}, { status: 'success' }, { status: 'success', profile: null }])(
		'rejects malformed loader responses (%#)',
		async (data) => {
			mockRead(data);
			expect(await readSavedProfile()).toEqual({ status: 'error' });
		},
	);
	it.each([
		{ id: 12 },
		{ username: null },
		{ city: undefined },
		{ city: 42 },
		{ activeProfile: null },
		{ activeProfile: { ...loaded().profile.activeProfile, description: undefined } },
		{ activeProfile: { ...loaded().profile.activeProfile, description: { html: 'private' } } },
		{ activeProfile: { ...loaded().profile.activeProfile, profileSkills: [{ id: 0 }] } },
		{ activeProfile: { ...loaded().profile.activeProfile, profileSkills: [{ id: 1 }, { id: 1 }] } },
		{
			activeProfile: {
				...loaded().profile.activeProfile,
				socialNetwork: [
					{ code: 'github', title: 'A' },
					{ code: 'github', title: 'B' },
				],
			},
		},
		{
			activeProfile: {
				...loaded().profile.activeProfile,
				socialNetwork: [{ code: 'github', title: null }],
			},
		},
	])('rejects malformed projected fields (%#)', async (fields) => {
		mockRead({ status: 'success', profile: { ...loaded().profile, ...fields } });
		expect(await readSavedProfile()).toEqual({ status: 'error' });
		expect(mutateOwnProfile).not.toHaveBeenCalled();
	});
});
