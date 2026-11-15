import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { ProfileEditInput, ProfileEditResult } from '../model/types/profileEdit';
import type { ProfileBackendConfig } from './profile.server';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
// Union of the existing React fields and the backend SocialNetwork contract.
const socialCodes = new Set([
	'instagram',
	'linkedin',
	'twitter',
	'facebook',
	'github',
	'behance',
	'whatsapp',
	'telegram',
	'youtube',
	'vk',
	'dribble',
]);
const skillId = (value: unknown): value is number =>
	typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export const parseProfileEditInput = (value: unknown): ProfileEditInput | null => {
	if (
		!object(value) ||
		Object.keys(value).some(
			(key) =>
				![
					'username',
					'city',
					'socialNetwork',
					'description',
					'profileSkills',
					'expectedProfileId',
					'specializationId',
				].includes(key),
		)
	)
		return null;
	if (
		!['username', 'city', 'socialNetwork', 'profileSkills'].every((key) => own(value, key)) ||
		(own(value, 'expectedProfileId') &&
			(typeof value.expectedProfileId !== 'string' || !value.expectedProfileId)) ||
		(own(value, 'specializationId') &&
			(!skillId(value.specializationId) || !own(value, 'expectedProfileId'))) ||
		typeof value.username !== 'string' ||
		value.username.length < 2 ||
		value.username.length > 30 ||
		!(value.city === null || typeof value.city === 'string') ||
		!Array.isArray(value.socialNetwork) ||
		!Array.isArray(value.profileSkills) ||
		![...value.profileSkills].every(skillId) ||
		new Set(value.profileSkills).size !== value.profileSkills.length ||
		(own(value, 'description') &&
			(typeof value.description !== 'string' ||
				Buffer.byteLength(value.description, 'utf8') > 65_536))
	)
		return null;
	const links: ProfileEditInput['socialNetwork'] = [];
	const codes = new Set<string>();
	for (const link of value.socialNetwork) {
		if (
			!object(link) ||
			Object.keys(link).length !== 2 ||
			!own(link, 'code') ||
			!own(link, 'title') ||
			typeof link.code !== 'string' ||
			!socialCodes.has(link.code) ||
			codes.has(link.code) ||
			typeof link.title !== 'string'
		)
			return null;
		codes.add(link.code);
		links.push({ code: link.code, title: link.title });
	}
	return {
		username: value.username,
		...(own(value, 'expectedProfileId')
			? { expectedProfileId: value.expectedProfileId as string }
			: {}),
		...(own(value, 'specializationId')
			? { specializationId: value.specializationId as number }
			: {}),
		city: value.city,
		socialNetwork: links,
		profileSkills: [...value.profileSkills],
		...(own(value, 'description') ? { description: value.description as string } : {}),
	};
};

type Credentials = { userId: string; accessToken: string; expiresAt: number };
type Failure = 'unauthorized' | 'forbidden' | 'error';
const failure = (status: number): Failure =>
	status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : 'error';

// Each request, including response parsing, has a deadline. A timed-out request never starts the next mutation.
const request = async (
	config: ProfileBackendConfig,
	path: string,
	method: 'GET' | 'PUT' | 'PATCH',
	init: { headers: Record<string, string>; body?: string },
): Promise<{ status: number; body: unknown }> => {
	const result = await backendHttp({
		config,
		path,
		method,
		effect: method === 'GET' ? 'read' : 'mutation',
		...init,
		cache: 'no-store',
		timeoutMs: 5000,
		decode: async (response) => ({
			status: response.status,
			body: response.status === 200 ? ((await response.json()) as unknown) : null,
		}),
	});
	if (result.status === 'error') {
		// Redirects were ordinary non-200 failures, not uncertain transport exceptions.
		if (result.kind === 'redirect') return { status: 0, body: null };
		throw new Error('Profile request failed');
	}
	return result.value;
};

export const saveOwnProfile = async (
	input: unknown,
	credentials: Credentials,
	config: ProfileBackendConfig,
): Promise<ProfileEditResult> => {
	const data = parseProfileEditInput(input);
	if (!data) return { status: 'validation-error' };
	const validSession = () => credentials.expiresAt > Math.floor(Date.now() / 1000);
	if (!validSession()) return { status: 'unauthorized' };
	let confirmed = false;
	let attempted = false;
	let userAttempted = false;
	try {
		const origin = new URL(config.apiOrigin);
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			origin.origin !== config.apiOrigin ||
			!['http:', 'https:'].includes(origin.protocol)
		)
			return { status: 'error' };
		if (!credentials.userId || !/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken))
			return { status: 'unauthorized' };
		const loaded = await request(config, '/auth/profile', 'GET', {
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
		});
		if (loaded.status !== 200) return { status: failure(loaded.status) };
		const current = loaded.body;
		if (!object(current) || typeof current.id !== 'string') return { status: 'error' };
		if (current.id !== credentials.userId) return { status: 'unauthorized' };
		if (
			!Array.isArray(current.profiles) ||
			!current.profiles.every((profile) => object(profile) && typeof profile.isActive === 'boolean')
		)
			return { status: 'error' };
		const profiles = current.profiles.filter(
			(profile) => object(profile) && profile.isActive === true,
		);
		if (
			profiles.length !== 1 ||
			!object(profiles[0]) ||
			typeof profiles[0].id !== 'string' ||
			!profiles[0].id
		)
			return { status: 'error' };
		const profileId = profiles[0].id;
		if (data.expectedProfileId !== undefined && data.expectedProfileId !== profileId)
			return { status: 'forbidden' };
		if (data.specializationId !== undefined && profiles[0].specializationId !== 0)
			return { status: 'validation-error' };
		if (
			data.specializationId !== undefined &&
			current.profiles.some(
				(profile) =>
					object(profile) &&
					profile.id !== profileId &&
					profile.specializationId === data.specializationId,
			)
		)
			return { status: 'validation-error' };
		const originalDescription = profiles[0].description;
		if (
			data.specializationId !== undefined &&
			originalDescription !== undefined &&
			originalDescription !== null &&
			typeof originalDescription !== 'string'
		)
			return { status: 'error' };
		// Unknown records are immutable server data, never accepted from the client.
		const existing = profiles[0].socialNetwork ?? [];
		if (!Array.isArray(existing)) return { status: 'error' };
		const unknownLinks: ProfileEditInput['socialNetwork'] = [];
		const existingCodes = new Set<string>();
		for (const link of existing) {
			if (
				!object(link) ||
				typeof link.code !== 'string' ||
				!link.code ||
				typeof link.title !== 'string' ||
				existingCodes.has(link.code)
			)
				return { status: 'error' };
			existingCodes.add(link.code);
			if (!socialCodes.has(link.code)) unknownLinks.push({ code: link.code, title: link.title });
		}
		const socialNetwork = [...data.socialNetwork, ...unknownLinks];
		if (!validSession()) return { status: 'unauthorized' };
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.accessToken}`,
		};
		const body = {
			socialNetwork,
			profileSkills: data.profileSkills,
			...(data.specializationId !== undefined ? { specializationId: data.specializationId } : {}),
			...(own(data, 'description') ? { description: data.description } : {}),
		};
		attempted = true;
		const saved = await request(config, `/profiles/${encodeURIComponent(profileId)}`, 'PUT', {
			headers,
			body: JSON.stringify(body),
		});
		if (saved.status !== 200) return { status: failure(saved.status) };
		const value = saved.body;
		if (
			!object(value) ||
			value.id !== profileId ||
			!Array.isArray(value.profileSkills) ||
			value.profileSkills.length !== data.profileSkills.length ||
			!value.profileSkills.every((skill) => object(skill) && skillId(skill.id)) ||
			new Set(value.profileSkills.map((skill) => (skill as Record<string, unknown>).id)).size !==
				data.profileSkills.length ||
			!value.profileSkills.every((skill) =>
				data.profileSkills.includes((skill as { id: number }).id),
			) ||
			!Array.isArray(value.socialNetwork) ||
			value.socialNetwork.length !== socialNetwork.length ||
			!value.socialNetwork.every(
				(link, index) =>
					object(link) &&
					link.code === socialNetwork[index].code &&
					link.title === socialNetwork[index].title,
			) ||
			(own(data, 'description') && value.description !== data.description)
		)
			return {
				status: 'partial-success',
				profile: 'unconfirmed',
				user: 'not-attempted',
				reason: 'error',
			};
		confirmed = true;
		if (!validSession())
			return {
				status: 'partial-success',
				profile: 'confirmed',
				user: 'not-attempted',
				reason: 'unauthorized',
			};
		userAttempted = true;
		const user = await request(config, `/users/${encodeURIComponent(current.id)}`, 'PATCH', {
			headers,
			body: JSON.stringify({ username: data.username, city: data.city }),
		});
		if (user.status !== 200)
			return {
				status: 'partial-success',
				profile: 'confirmed',
				user: 'unconfirmed',
				reason: failure(user.status),
			};
		if (
			!object(user.body) ||
			user.body.id !== credentials.userId ||
			user.body.username !== data.username ||
			user.body.city !== data.city
		)
			return {
				status: 'partial-success',
				profile: 'confirmed',
				user: 'unconfirmed',
				reason: 'error',
			};
		if (data.specializationId !== undefined) {
			confirmed = false;
			if (!validSession())
				return {
					status: 'partial-success',
					profile: 'unconfirmed',
					user: 'unconfirmed',
					reason: 'unauthorized',
				};
			const readback = await request(config, '/auth/profile', 'GET', {
				headers: { Authorization: `Bearer ${credentials.accessToken}` },
			});
			const loaded = readback.body;
			const active =
				object(loaded) && Array.isArray(loaded.profiles)
					? loaded.profiles.filter((profile) => object(profile) && profile.isActive === true)
					: [];
			const profile = active[0];
			if (
				readback.status !== 200 ||
				!object(loaded) ||
				loaded.id !== credentials.userId ||
				loaded.username !== data.username ||
				loaded.city !== data.city ||
				active.length !== 1 ||
				!object(profile) ||
				profile.id !== profileId ||
				profile.specializationId !== data.specializationId ||
				(profile.description ?? null) !==
					(own(data, 'description') ? data.description : (originalDescription ?? null)) ||
				!Array.isArray(profile.profileSkills) ||
				profile.profileSkills.length !== data.profileSkills.length ||
				!profile.profileSkills.every(
					(skill) => object(skill) && skillId(skill.id) && data.profileSkills.includes(skill.id),
				) ||
				new Set(profile.profileSkills.map((skill) => (object(skill) ? skill.id : undefined)))
					.size !== data.profileSkills.length ||
				!Array.isArray(profile.socialNetwork) ||
				profile.socialNetwork.length !== socialNetwork.length ||
				!profile.socialNetwork.every(
					(link, index) =>
						object(link) &&
						link.code === socialNetwork[index].code &&
						link.title === socialNetwork[index].title,
				)
			)
				return {
					status: 'partial-success',
					profile: 'unconfirmed',
					user: 'unconfirmed',
					reason: readback.status === 200 ? 'error' : failure(readback.status),
				};
		}
		return { status: 'success' };
	} catch {
		if (attempted)
			return {
				status: 'partial-success',
				profile: confirmed ? 'confirmed' : 'unconfirmed',
				user: userAttempted ? 'unconfirmed' : 'not-attempted',
				reason: 'error',
			};
		return { status: 'error' };
	}
};
