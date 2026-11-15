import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { ActiveProfile, OwnProfile, OwnProfileResult } from '../model/types/profile';

export interface ProfileBackendConfig {
	apiOrigin: string;
	allowedOrigins: readonly string[];
}

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const nullableString = (value: unknown): value is string | null =>
	value === null || typeof value === 'string';
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const projectActive = (value: Record<string, unknown>): ActiveProfile | null => {
	if (
		!text(value.id) ||
		!Number.isInteger(value.specializationId) ||
		(value.description !== undefined && !nullableString(value.description)) ||
		!Array.isArray(value.profileSkills) ||
		(value.socialNetwork !== undefined &&
			value.socialNetwork !== null &&
			!Array.isArray(value.socialNetwork))
	)
		return null;
	const skills: ActiveProfile['profileSkills'] = [];
	for (const skill of value.profileSkills) {
		if (
			!object(skill) ||
			!Number.isInteger(skill.id) ||
			!text(skill.title) ||
			(skill.imageSrc !== undefined && !nullableString(skill.imageSrc))
		)
			return null;
		skills.push({ id: skill.id as number, title: skill.title, imageSrc: skill.imageSrc ?? null });
	}
	const links: ActiveProfile['socialNetwork'] = [];
	for (const link of (value.socialNetwork ?? []) as unknown[]) {
		if (!object(link) || !text(link.code) || !text(link.title)) return null;
		links.push({ code: link.code, title: link.title });
	}
	return {
		id: value.id,
		specializationId: value.specializationId as number,
		description: value.description ?? null,
		socialNetwork: links,
		profileSkills: skills,
	};
};

// Credentials are supplied only by the server composition root; never a Server Action argument.
export const readOwnProfile = async (
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
): Promise<OwnProfileResult> => {
	try {
		if (!text(credentials.userId) || !/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken))
			return { status: 'error' };
		const result = await backendHttp<OwnProfileResult>({
			config,
			path: '/auth/profile',
			method: 'GET',
			effect: 'read',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status !== 200) return { status: 'error' };
				const data: unknown = await response.json();
				if (!object(data) || !text(data.id)) return { status: 'error' };
				if (data.id !== credentials.userId) return { status: 'identity-mismatch' };
				if (
					!text(data.username) ||
					typeof data.email !== 'string' ||
					typeof data.isVerified !== 'boolean' ||
					!['avatarUrl', 'birthday', 'country', 'city'].every((key) => nullableString(data[key])) ||
					!Array.isArray(data.userRoles) ||
					!Array.isArray(data.profiles)
				)
					return { status: 'error' };
				const roles: OwnProfile['userRoles'] = [];
				for (const role of data.userRoles) {
					if (!object(role) || !Number.isInteger(role.id) || !text(role.name))
						return { status: 'error' };
					roles.push({ id: role.id as number, name: role.name });
				}
				if (
					!data.profiles.every(
						(profile) => object(profile) && typeof profile.isActive === 'boolean',
					)
				)
					return { status: 'error' };
				const active = data.profiles.filter(
					(profile: Record<string, unknown>) => profile.isActive === true,
				);
				if (active.length === 0) return { status: 'no-active-profile' };
				if (active.length !== 1) return { status: 'error' };
				const activeProfile = projectActive(active[0]);
				if (!activeProfile) return { status: 'error' };
				return {
					status: 'success',
					profile: {
						id: data.id,
						username: data.username,
						email: data.email,
						isVerified: data.isVerified,
						avatarUrl: data.avatarUrl as string | null,
						birthday: data.birthday as string | null,
						country: data.country as string | null,
						city: data.city as string | null,
						userRoles: roles,
						activeProfile,
					},
				};
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
