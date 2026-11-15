import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { HeaderProfileResult } from '../model/types/profile';
import type { ProfileBackendConfig } from './profile.server';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const validAvatar = (value: unknown): value is string | null => {
	if (value === null || value === '') return true;
	if (typeof value !== 'string') return false;
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
	} catch {
		return false;
	}
};

// Read only the display projection; an active profile and unrelated AuthUser fields are not required.
export const readHeaderProfile = async (
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
): Promise<HeaderProfileResult> => {
	try {
		if (!credentials.userId || !/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken))
			return { status: 'error' };
		const result = await backendHttp<HeaderProfileResult>({
			config,
			path: '/auth/profile',
			method: 'GET',
			effect: 'read',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 403) return { status: 'forbidden' };
				if (response.status !== 200) return { status: 'error' };
				const data: unknown = await response.json();
				if (!object(data) || typeof data.id !== 'string' || !data.id) return { status: 'error' };
				if (data.id !== credentials.userId) return { status: 'identity-mismatch' };
				if (
					!validAvatar(data.avatarUrl) ||
					typeof data.username !== 'string' ||
					!data.username.trim() ||
					(data.email !== null && typeof data.email !== 'string')
				)
					return { status: 'error' };
				return {
					status: 'success',
					profile: {
						userId: data.id,
						avatarUrl: data.avatarUrl || null,
						username: data.username,
						email: data.email,
					},
				};
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
