import 'server-only';

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
			(key) => !['username', 'city', 'socialNetwork', 'description', 'profileSkills'].includes(key),
		)
	)
		return null;
	if (
		!['username', 'city', 'socialNetwork', 'profileSkills'].every((key) => own(value, key)) ||
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
const request = async (url: URL, init: RequestInit): Promise<{ status: number; body: unknown }> => {
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			(async () => {
				const response = await fetch(url, {
					...init,
					cache: 'no-store',
					credentials: 'omit',
					redirect: 'manual',
					signal: controller.signal,
				});
				return {
					status: response.status,
					body: response.status === 200 ? ((await response.json()) as unknown) : null,
				};
			})(),
			new Promise<never>((_, reject) => {
				timer = setTimeout(() => {
					controller.abort();
					reject(new Error('Profile request timed out'));
				}, 5000);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
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
		const loaded = await request(new URL('/auth/profile', origin), {
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
			...(own(data, 'description') ? { description: data.description } : {}),
		};
		attempted = true;
		const saved = await request(new URL(`/profiles/${encodeURIComponent(profileId)}`, origin), {
			method: 'PUT',
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
		const user = await request(new URL(`/users/${encodeURIComponent(current.id)}`, origin), {
			method: 'PATCH',
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
