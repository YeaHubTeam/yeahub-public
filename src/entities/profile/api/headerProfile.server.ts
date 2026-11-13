import 'server-only';

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
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			!credentials.userId ||
			!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
		)
			return { status: 'error' };
		const request = async (): Promise<HeaderProfileResult> => {
			const response = await fetch(new URL('/auth/profile', config.apiOrigin), {
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
				headers: { Authorization: `Bearer ${credentials.accessToken}` },
			});
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
		};
		const timeout = new Promise<HeaderProfileResult>((resolve) => {
			timer = setTimeout(() => {
				controller.abort();
				resolve({ status: 'error' });
			}, 5000);
		});
		return await Promise.race([request(), timeout]);
	} catch {
		return { status: 'error' };
	} finally {
		clearTimeout(timer);
	}
};
