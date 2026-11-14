'use server';

import 'server-only';

import { getOwnProfile, mutateOwnProfile } from '@/auth';
import type {
	ActiveProfile,
	OwnProfile,
	ProfileEditInput,
	ProfileEditResult,
} from '@/entities/profile';
import { getSpecializationById } from '@/entities/specialization';

export async function saveProfile(input: ProfileEditInput): Promise<ProfileEditResult> {
	try {
		if (object(input) && Object.prototype.hasOwnProperty.call(input, 'specializationId')) {
			if (
				!Number.isSafeInteger(input.specializationId) ||
				typeof input.specializationId !== 'number' ||
				input.specializationId <= 0 ||
				typeof input.expectedProfileId !== 'string' ||
				!input.expectedProfileId
			)
				return { status: 'validation-error' };
			const own = await getOwnProfile();
			if (own.status === 'unauthenticated' || own.status === 'refresh-required')
				return { status: 'unauthorized' };
			if (own.status !== 'success') return { status: 'error' };
			if (own.profile.activeProfile.id !== input.expectedProfileId) return { status: 'forbidden' };
			if (own.profile.activeProfile.specializationId !== 0) return { status: 'validation-error' };
			const specialization = await getSpecializationById(input.specializationId).catch(() => null);
			if (specialization?.id !== input.specializationId) return { status: 'validation-error' };
		}
		return await mutateOwnProfile(input);
	} catch {
		return { status: 'error' };
	}
}

export type SavedProfile = Pick<
	ProfileEditInput,
	'username' | 'city' | 'socialNetwork' | 'profileSkills'
> & {
	id: OwnProfile['id'];
	profileId: ActiveProfile['id'];
	specializationId: ActiveProfile['specializationId'];
	description: ActiveProfile['description'];
};

export type ReadSavedProfileResult =
	| { status: 'success'; profile: SavedProfile }
	| { status: 'unauthorized' | 'refresh-required' | 'error' };

// The editor exposes only these nine networks; other persisted records stay server-owned.
const editableSocialCodes = new Set([
	'instagram',
	'linkedin',
	'twitter',
	'facebook',
	'github',
	'behance',
	'whatsapp',
	'telegram',
	'youtube',
]);
const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const nullableText = (value: unknown): value is string | null =>
	value === null || typeof value === 'string';

const projectSavedProfile = (value: unknown): SavedProfile | null => {
	if (!object(value) || !text(value.id) || !text(value.username) || !nullableText(value.city))
		return null;
	const active = value.activeProfile;
	if (
		!object(active) ||
		!text(active.id) ||
		!Number.isSafeInteger(active.specializationId) ||
		typeof active.specializationId !== 'number' ||
		active.specializationId < 0 ||
		!nullableText(active.description) ||
		!Array.isArray(active.socialNetwork) ||
		!Array.isArray(active.profileSkills)
	)
		return null;
	const profileSkills: number[] = [];
	for (const skill of active.profileSkills) {
		if (
			!object(skill) ||
			typeof skill.id !== 'number' ||
			!Number.isSafeInteger(skill.id) ||
			skill.id <= 0
		)
			return null;
		profileSkills.push(skill.id);
	}
	if (new Set(profileSkills).size !== profileSkills.length) return null;
	const socialNetwork: SavedProfile['socialNetwork'] = [];
	const codes = new Set<string>();
	for (const link of active.socialNetwork) {
		if (!object(link) || !text(link.code) || typeof link.title !== 'string') return null;
		if (!editableSocialCodes.has(link.code)) continue;
		if (codes.has(link.code)) return null;
		codes.add(link.code);
		socialNetwork.push({ code: link.code, title: link.title });
	}
	return {
		id: value.id,
		profileId: active.id,
		specializationId: active.specializationId,
		username: value.username,
		city: value.city,
		description: active.description,
		socialNetwork,
		profileSkills,
	};
};

export async function readSavedProfile(): Promise<ReadSavedProfileResult> {
	try {
		// This server loader resolves identity and credentials itself; never forward client arguments.
		const result: unknown = await getOwnProfile();
		if (!object(result)) return { status: 'error' };
		if (result.status === 'unauthenticated') return { status: 'unauthorized' };
		if (result.status === 'refresh-required') return { status: 'refresh-required' };
		if (result.status !== 'success') return { status: 'error' };
		const profile = projectSavedProfile(result.profile);
		return profile ? { status: 'success', profile } : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
}
