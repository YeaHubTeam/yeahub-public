import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type {
	ProfileCreationResult,
	ProfileDeletionResult,
	ProfileSelectionResult,
} from '../model/types/profileManagement';
import type { ProfileBackendConfig } from './profile.server';
import { readSettingsSnapshot } from './settings.server';

export const selectOwnProfile = async (
	profileId: unknown,
	credentials: {
		userId: string;
		accessToken: string;
		accessExpiresAt: number;
		sessionDeadline: number;
	},
	config: ProfileBackendConfig,
): Promise<ProfileSelectionResult> => {
	if (
		typeof profileId !== 'string' ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
	)
		return { status: 'not-found' };
	const validity = () => {
		const now = Math.floor(Date.now() / 1000);
		if (credentials.sessionDeadline <= now) return 'unauthenticated';
		if (credentials.accessExpiresAt <= now) return 'refresh-required';
		return null;
	};
	const expired = validity();
	if (expired) return { status: expired };
	const before = await readSettingsSnapshot(credentials, config);
	if (before.status !== 'success')
		return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
	const profile = before.snapshot.profiles.find((item) => item.id === profileId);
	if (!profile) return { status: 'not-found' };
	const expiredAfterRead = validity();
	if (expiredAfterRead) return { status: expiredAfterRead };
	if (profile.isActive && before.snapshot.activeProfileId === profileId)
		return {
			status: 'success',
			profileId,
			specializationId: profile.specializationId,
			changed: false,
		};
	try {
		const transport = await backendHttp<ProfileSelectionResult>({
			config,
			path: `/profiles/${profileId}/active`,
			method: 'PATCH',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: (response) =>
				Promise.resolve(
					((): ProfileSelectionResult => {
						if (response.status === 401) return { status: 'unauthenticated' };
						if (response.status === 403) return { status: 'forbidden' };
						if (response.status === 404) return { status: 'not-found' };
						if (response.status >= 500) return { status: 'outcome-unknown' };
						if (response.status !== 204) return { status: 'error' };
						// An empty 204 confirms the mutation endpoint only; the selected profile still needs readback.
						return {
							status: 'success',
							profileId,
							specializationId: profile.specializationId,
							changed: true,
						};
					})(),
				),
		});
		if (transport.status === 'error')
			return { status: transport.kind === 'redirect' ? 'error' : 'outcome-unknown' };
		if (transport.value.status !== 'success') return transport.value;
	} catch {
		return { status: 'outcome-unknown' };
	}
	if (validity()) return { status: 'incomplete' };
	const after = await readSettingsSnapshot(credentials, config);
	if (after.status !== 'success' || after.snapshot.activeProfileId !== profileId)
		return { status: 'incomplete' };
	const selected = after.snapshot.profiles.find((item) => item.id === profileId && item.isActive);
	if (!selected) return { status: 'incomplete' };
	return {
		status: 'success',
		profileId,
		specializationId: selected.specializationId,
		changed: true,
	};
};

// Invoked only by the private auth composition. No creation fields come from a client.
export const createOwnProfile = async (
	credentials: Parameters<typeof selectOwnProfile>[1],
	config: ProfileBackendConfig,
): Promise<ProfileCreationResult> => {
	const validity = () => {
		const now = Math.floor(Date.now() / 1000);
		if (credentials.sessionDeadline <= now) return 'unauthenticated';
		if (credentials.accessExpiresAt <= now) return 'refresh-required';
		return null;
	};
	const expired = validity();
	if (expired) return { status: expired };
	const before = await readSettingsSnapshot(credentials, config);
	if (before.status !== 'success')
		return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
	if (before.snapshot.profiles.some((profile) => profile.specializationId === 0))
		return { status: 'unfinished-profile-exists' };
	if (before.snapshot.profiles.length >= (before.snapshot.hasPremiumAccess ? 10 : 3))
		return { status: 'limit-reached' };
	const expiredAfterRead = validity();
	if (expiredAfterRead) return { status: expiredAfterRead };
	let accepted = false;
	let createdId: string | null = null;
	try {
		const transport = await backendHttp<ProfileCreationResult>({
			config,
			path: '/profiles',
			method: 'POST',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: credentials.userId,
				profileType: 1,
				specializationId: 0,
				markingWeight: 1,
			}),
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 403) return { status: 'forbidden' };
				if (response.status >= 500) return { status: 'outcome-unknown' };
				if (response.status !== 201) return { status: 'error' };
				accepted = true;
				const value: unknown = await response.json().catch(() => null);
				if (typeof value !== 'object' || value === null || Array.isArray(value))
					return { status: 'incomplete' };
				const profile = value as Record<string, unknown>;
				if (
					typeof profile.id !== 'string' ||
					!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id) ||
					profile.userId !== credentials.userId ||
					profile.specializationId !== 0 ||
					profile.isActive !== true ||
					before.snapshot.profiles.some((item) => item.id === profile.id)
				)
					return { status: 'incomplete' };
				return { status: 'success', profileId: profile.id };
			},
		});
		const mutation: ProfileCreationResult =
			transport.status === 'response'
				? transport.value
				: {
						status: accepted
							? 'incomplete'
							: transport.kind === 'redirect'
								? 'error'
								: 'outcome-unknown',
					};
		if (mutation.status === 'success') createdId = mutation.profileId;
		else if (!accepted || mutation.status !== 'incomplete') return mutation;
	} catch {
		return { status: accepted ? 'incomplete' : 'outcome-unknown' };
	}
	if (validity()) return { status: 'incomplete' };
	// Even a malformed 201 must not be retried: read fresh state, but require a trustworthy created ID.
	const after = await readSettingsSnapshot(credentials, config);
	if (validity() || after.status !== 'success' || !createdId) return { status: 'incomplete' };
	const active = after.snapshot.profiles.filter((profile) => profile.isActive);
	if (
		after.snapshot.userId !== credentials.userId ||
		after.snapshot.activeProfileId !== createdId ||
		active.length !== 1 ||
		active[0].id !== createdId ||
		active[0].specializationId !== 0
	)
		return { status: 'incomplete' };
	return { status: 'success', profileId: createdId };
};

export const deleteOwnProfile = async (
	profileId: unknown,
	confirmationUsername: unknown,
	credentials: Parameters<typeof selectOwnProfile>[1],
	config: ProfileBackendConfig,
): Promise<ProfileDeletionResult> => {
	// Match the UUID syntax already used by profile selection and backend ParseUUIDPipe (all).
	if (
		typeof profileId !== 'string' ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId) ||
		typeof confirmationUsername !== 'string'
	)
		return { status: 'invalid-input' };
	const validity = () => {
		const now = Math.floor(Date.now() / 1000);
		if (credentials.sessionDeadline <= now) return 'unauthenticated';
		if (credentials.accessExpiresAt <= now) return 'refresh-required';
		return null;
	};
	const expired = validity();
	if (expired) return { status: expired };
	const before = await readSettingsSnapshot(credentials, config);
	if (before.status !== 'success')
		return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
	const snapshot = before.snapshot;
	const target = snapshot.profiles.find((profile) => profile.id === profileId);
	if (!target) return { status: 'forbidden' };
	const active = snapshot.profiles.filter((profile) => profile.isActive);
	if (active.length !== 1 || snapshot.activeProfileId !== active[0].id) return { status: 'error' };
	if (snapshot.profiles.length <= 1) return { status: 'last-profile' };
	if (target.isActive || snapshot.activeProfileId === profileId)
		return { status: 'active-profile' };
	if (
		typeof snapshot.username !== 'string' ||
		!snapshot.username ||
		confirmationUsername !== snapshot.username
	)
		return { status: 'confirmation-mismatch' };
	const expiredAfterRead = validity();
	if (expiredAfterRead) return { status: expiredAfterRead };
	try {
		const transport = await backendHttp<ProfileDeletionResult>({
			config,
			path: `/profiles/${profileId}`,
			method: 'DELETE',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: (response) =>
				Promise.resolve(
					((): ProfileDeletionResult => {
						if (response.status === 204) return { status: 'success' };
						if (response.status === 400) return { status: 'invalid-input' };
						if (response.status === 401) return { status: 'unauthenticated' };
						if (response.status === 403 || response.status === 404) return { status: 'forbidden' };
						return { status: response.status >= 500 ? 'outcome-unknown' : 'error' };
					})(),
				),
		});
		if (transport.status === 'error')
			return { status: transport.kind === 'redirect' ? 'error' : 'outcome-unknown' };
		if (transport.value.status !== 'success') return transport.value;
	} catch {
		return { status: 'outcome-unknown' };
	}
	if (validity()) return { status: 'incomplete' };
	// Snapshot errors deliberately hide transport details. Enforce an explicit readback time budget
	// so a timeout can remain distinguishable without changing the shared read-only loader.
	let readTimer: ReturnType<typeof setTimeout> | undefined;
	try {
		const timeout = new Promise<'timeout'>((resolve) => {
			readTimer = setTimeout(() => resolve('timeout'), 5000);
		});
		const after = await Promise.race([readSettingsSnapshot(credentials, config), timeout]);
		if (after === 'timeout') return { status: 'outcome-unknown' };
		if (after.status !== 'success' || validity()) return { status: 'incomplete' };
		const remaining = snapshot.profiles.filter((profile) => profile.id !== profileId);
		const profiles = after.snapshot.profiles;
		if (
			after.snapshot.userId !== credentials.userId ||
			after.snapshot.activeProfileId !== snapshot.activeProfileId ||
			profiles.length === 0 ||
			profiles.length !== remaining.length ||
			profiles.some((profile) => profile.id === profileId) ||
			profiles.filter((profile) => profile.isActive).length !== 1 ||
			!remaining.every((profile) =>
				profiles.some(
					(current) =>
						current.id === profile.id &&
						current.specializationId === profile.specializationId &&
						current.isActive === profile.isActive,
				),
			)
		)
			return { status: 'incomplete' };
		return { status: 'success' };
	} catch {
		return { status: 'incomplete' };
	} finally {
		clearTimeout(readTimer);
	}
};
