import type { ActiveProfile, OwnProfile, ProfileEditInput } from '@/entities/profile';
import {
	PERSONAL_SOCIAL_CODES,
	createPersonalDefaults,
	toPersonalPayload,
} from '@/features/profile/editPersonal';
import type { PersonalFormValues } from '@/features/profile/editPersonal';
import { getInitialSkillIds } from '@/features/profile/editSkills';

export type EditProfileValues = PersonalFormValues & {
	description: string;
	profileSkills: number[];
};
export type SavedProfileSnapshot = Pick<
	ProfileEditInput,
	'username' | 'city' | 'socialNetwork' | 'profileSkills'
> & {
	id: OwnProfile['id'];
	profileId: ActiveProfile['id'];
	description: ActiveProfile['description'];
};
export const createEditDefaults = (profile: OwnProfile): EditProfileValues => ({
	...createPersonalDefaults(profile),
	description: profile.activeProfile.description ?? '',
	profileSkills: getInitialSkillIds(profile.activeProfile.profileSkills),
});
export const toEditPayload = (
	values: EditProfileValues,
	rawDescription: string | null,
): ProfileEditInput => ({
	...toPersonalPayload(values),
	profileSkills: [...values.profileSkills],
	...(values.description !== (rawDescription ?? '') ? { description: values.description } : {}),
});
const sameIds = (a: readonly number[], b: readonly number[]) =>
	a.length === b.length && new Set(a).size === new Set(b).size && a.every((id) => b.includes(id));
const sortedLinks = (links: { code: string; title: string }[]) =>
	[...links].sort((a, b) => a.code.localeCompare(b.code));
const sameLinks = (a: { code: string; title: string }[], b: { code: string; title: string }[]) =>
	JSON.stringify(sortedLinks(a)) === JSON.stringify(sortedLinks(b));
export const sameEditValues = (a: EditProfileValues, b: EditProfileValues) =>
	a.username === b.username &&
	a.city === b.city &&
	a.description === b.description &&
	sameIds(a.profileSkills, b.profileSkills) &&
	sameLinks(a.socialNetwork, b.socialNetwork);
export const matchesSavedProfile = (
	saved: SavedProfileSnapshot,
	sent: ProfileEditInput,
	expected: {
		id: string;
		profileId: string;
		description: string | null;
	},
) =>
	saved.id === expected.id &&
	saved.profileId === expected.profileId &&
	saved.username === sent.username &&
	saved.city === sent.city &&
	saved.description ===
		(sent.description === undefined ? expected.description : sent.description) &&
	sameIds(saved.profileSkills, sent.profileSkills) &&
	sameLinks(saved.socialNetwork, sent.socialNetwork);
export const savedToEditValues = (saved: SavedProfileSnapshot): EditProfileValues => ({
	username: saved.username,
	city: saved.city ?? '',
	description: saved.description ?? '',
	profileSkills: [...saved.profileSkills],
	socialNetwork: PERSONAL_SOCIAL_CODES.map((code) => ({
		code,
		title: saved.socialNetwork.find((link) => link.code === code)?.title ?? '',
	})),
});
