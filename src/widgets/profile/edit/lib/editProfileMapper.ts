import type { ActiveProfile, OwnProfile, ProfileEditInput } from '@/entities/profile';
import {
	PERSONAL_SOCIAL_CODES,
	createPersonalDefaults,
	toPersonalPayload,
} from '@/features/profile/editPersonal';
import type { PersonalFormValues } from '@/features/profile/editPersonal';
import { getInitialSkillIds } from '@/features/profile/editSkills';

export type EditProfileValues = PersonalFormValues & {
	// Optional for legacy readback/callers; createEditDefaults always initializes it.
	specializationId?: number;
	description: string;
	profileSkills: number[];
};
export type SavedProfileSnapshot = Pick<
	ProfileEditInput,
	'username' | 'city' | 'socialNetwork' | 'profileSkills'
> & {
	id: OwnProfile['id'];
	profileId: ActiveProfile['id'];
	specializationId?: ActiveProfile['specializationId'];
	description: ActiveProfile['description'];
};
export const createEditDefaults = (profile: OwnProfile): EditProfileValues => ({
	...createPersonalDefaults(profile),
	specializationId: profile.activeProfile.specializationId,
	description: profile.activeProfile.description ?? '',
	profileSkills: getInitialSkillIds(profile.activeProfile.profileSkills),
});
export type InitialProfileContext = Pick<ActiveProfile, 'id' | 'specializationId'>;
export const toEditPayload = (
	values: EditProfileValues,
	rawDescription: string | null,
	initialProfile?: InitialProfileContext,
): ProfileEditInput => {
	if (initialProfile) {
		const id = values.specializationId;
		if (
			!initialProfile.id ||
			typeof id !== 'number' ||
			!Number.isSafeInteger(id) ||
			id <= 0 ||
			!Number.isSafeInteger(initialProfile.specializationId) ||
			initialProfile.specializationId < 0 ||
			(initialProfile.specializationId !== 0 && id !== initialProfile.specializationId)
		)
			throw new Error('Invalid initial specialization selection');
	}
	return {
		...toPersonalPayload(values),
		profileSkills: [...values.profileSkills],
		...(values.description !== (rawDescription ?? '') ? { description: values.description } : {}),
		...(initialProfile ? { expectedProfileId: initialProfile.id } : {}),
		...(initialProfile?.specializationId === 0
			? { specializationId: values.specializationId }
			: {}),
	};
};
const sameIds = (a: readonly number[], b: readonly number[]) =>
	a.length === b.length && new Set(a).size === new Set(b).size && a.every((id) => b.includes(id));
const sortedLinks = (links: { code: string; title: string }[]) =>
	[...links].sort((a, b) => a.code.localeCompare(b.code));
const sameLinks = (a: { code: string; title: string }[], b: { code: string; title: string }[]) =>
	JSON.stringify(sortedLinks(a)) === JSON.stringify(sortedLinks(b));
export const sameEditValues = (a: EditProfileValues, b: EditProfileValues) =>
	a.specializationId === b.specializationId &&
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
	(sent.expectedProfileId === undefined || saved.profileId === sent.expectedProfileId) &&
	(sent.specializationId === undefined || saved.specializationId === sent.specializationId) &&
	saved.username === sent.username &&
	saved.city === sent.city &&
	saved.description ===
		(sent.description === undefined ? expected.description : sent.description) &&
	sameIds(saved.profileSkills, sent.profileSkills) &&
	sameLinks(saved.socialNetwork, sent.socialNetwork);
export const savedToEditValues = (saved: SavedProfileSnapshot): EditProfileValues => ({
	specializationId: saved.specializationId,
	username: saved.username,
	city: saved.city ?? '',
	description: saved.description ?? '',
	profileSkills: [...saved.profileSkills],
	socialNetwork: PERSONAL_SOCIAL_CODES.map((code) => ({
		code,
		title: saved.socialNetwork.find((link) => link.code === code)?.title ?? '',
	})),
});
