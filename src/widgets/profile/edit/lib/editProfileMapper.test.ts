import type { OwnProfile } from '@/entities/profile';

import {
	createEditDefaults,
	matchesSavedProfile,
	sameEditValues,
	savedToEditValues,
	toEditPayload,
} from './editProfileMapper';
import type { SavedProfileSnapshot } from './editProfileMapper';

const profile: OwnProfile = {
	id: 'user',
	username: ' Name ',
	email: 'private@example.invalid',
	city: null,
	birthday: null,
	country: null,
	avatarUrl: null,
	isVerified: true,
	userRoles: [],
	activeProfile: {
		id: 'active',
		specializationId: 1,
		description: null,
		socialNetwork: [
			{ code: 'github', title: 'GH' },
			{ code: 'legacy', title: 'Keep on server' },
		],
		profileSkills: [
			{ id: 999, title: 'Outside', imageSrc: null },
			{ id: 1, title: 'React', imageSrc: null },
		],
	},
};
const identity = { id: profile.id, profileId: profile.activeProfile.id, description: null };
it('initializes every field, nine known social entries, raw description and all skill IDs', () => {
	const defaults = createEditDefaults(profile);
	expect(defaults).toMatchObject({
		username: ' Name ',
		city: '',
		description: '',
		profileSkills: [999, 1],
	});
	expect(defaults.socialNetwork).toHaveLength(9);
	expect(defaults.socialNetwork.some((link) => (link.code as string) === 'legacy')).toBe(false);
});
it('omits every read-only field and unchanged null description while allowing city clear', () => {
	const values = {
		...createEditDefaults(profile),
		email: profile.email,
		avatar: 'ignored',
		specialization: 1,
	};
	expect(toEditPayload(values, null)).toEqual({
		username: ' Name ',
		city: '',
		socialNetwork: [{ code: 'github', title: 'GH' }],
		profileSkills: [999, 1],
	});
});
it('omits unchanged raw HTML, including persisted values above the current limit', () => {
	const raw = '<p>' + 'я'.repeat(65_536) + '</p>';
	expect(
		toEditPayload({ ...createEditDefaults(profile), description: raw }, raw),
	).not.toHaveProperty('description');
});
it.each(['<p>New HTML</p>', ''])('includes explicitly changed description %j', (description) => {
	expect(
		toEditPayload({ ...createEditDefaults(profile), description }, '<p>Old</p>'),
	).toHaveProperty('description', description);
});
const saved = (): SavedProfileSnapshot => ({
	id: 'user',
	profileId: 'active',
	specializationId: 1,
	username: ' Name ',
	city: '',
	description: null,
	profileSkills: [1, 999],
	socialNetwork: [{ code: 'github', title: 'GH' }],
});
it('compares skills as a set and social records by code, not order', () => {
	const values = createEditDefaults(profile);
	values.socialNetwork[0].title = 'Instagram';
	const sent = toEditPayload(values, null);
	expect(
		matchesSavedProfile(
			{ ...saved(), socialNetwork: [...sent.socialNetwork].reverse() },
			sent,
			identity,
		),
	).toBe(true);
});
it.each([
	{ id: 'another' },
	{ profileId: 'another' },
	{ username: 'Name' },
	{ city: null },
	{ description: '' },
	{ profileSkills: [1] },
	{ socialNetwork: [] },
])('rejects a real readback mismatch (%#)', (change) => {
	expect(
		matchesSavedProfile(
			{ ...saved(), ...change },
			toEditPayload(createEditDefaults(profile), null),
			identity,
		),
	).toBe(false);
});
it('distinguishes an explicit clear from null and checks it exactly', () => {
	const sent = toEditPayload({ ...createEditDefaults(profile), description: '' }, 'Old');
	expect(matchesSavedProfile(saved(), sent, { ...identity, description: 'Old' })).toBe(false);
	expect(
		matchesSavedProfile({ ...saved(), description: '' }, sent, { ...identity, description: 'Old' }),
	).toBe(true);
});
it('creates a new baseline with all nine fields without modifying newer values', () => {
	const confirmed = savedToEditValues(saved());
	expect(sameEditValues(confirmed, createEditDefaults(profile))).toBe(true);
	expect(sameEditValues({ ...confirmed, username: 'Newer draft' }, confirmed)).toBe(false);
});

it.each([0, 7])('initializes specialization %s from the active profile', (specializationId) => {
	expect(
		createEditDefaults({
			...profile,
			activeProfile: { ...profile.activeProfile, specializationId },
		}).specializationId,
	).toBe(specializationId);
});
it('maps initial selection with original identity and every other editable value', () => {
	const initial = { ...profile.activeProfile, specializationId: 0 };
	const values = {
		...createEditDefaults({ ...profile, activeProfile: initial }),
		specializationId: 7,
		description: 'Changed',
	};
	const sent = toEditPayload(values, null, initial);
	expect(sent).toEqual({
		expectedProfileId: 'active',
		specializationId: 7,
		username: ' Name ',
		city: '',
		description: 'Changed',
		profileSkills: [999, 1],
		socialNetwork: [{ code: 'github', title: 'GH' }],
	});
	expect(sent).not.toHaveProperty('avatar');
	expect(sent).not.toHaveProperty('userId');
});
it('does not assign an established specialization and guards the original profile', () => {
	expect(toEditPayload(createEditDefaults(profile), null, profile.activeProfile)).toEqual({
		...toEditPayload(createEditDefaults(profile), null),
		expectedProfileId: 'active',
	});
});
it.each([undefined, 0, -1, 1.5, '7', null])(
	'fails closed for invalid initial mapper selection %j',
	(specializationId) => {
		expect(() =>
			toEditPayload(
				{ ...createEditDefaults(profile), specializationId } as ReturnType<
					typeof createEditDefaults
				>,
				null,
				{ id: 'active', specializationId: 0 },
			),
		).toThrow();
	},
);
it('rejects changing an established specialization', () => {
	expect(() =>
		toEditPayload(
			{ ...createEditDefaults(profile), specializationId: 7 },
			null,
			profile.activeProfile,
		),
	).toThrow();
});
it('tracks specialization in dirty comparison and confirmed readback', () => {
	const defaults = createEditDefaults(profile);
	expect(sameEditValues(defaults, { ...defaults, specializationId: 7 })).toBe(false);
	const sent = toEditPayload({ ...defaults, specializationId: 7 }, null, {
		id: 'active',
		specializationId: 0,
	});
	expect(matchesSavedProfile({ ...saved(), specializationId: 7 }, sent, identity)).toBe(true);
	expect(matchesSavedProfile({ ...saved(), specializationId: 1 }, sent, identity)).toBe(false);
	expect(
		matchesSavedProfile({ ...saved(), specializationId: 7, profileId: 'another' }, sent, identity),
	).toBe(false);
	expect(savedToEditValues({ ...saved(), specializationId: 7 }).specializationId).toBe(7);
});
