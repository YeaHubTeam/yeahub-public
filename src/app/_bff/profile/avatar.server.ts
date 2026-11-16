import 'server-only';

import { backendHttp } from '@/shared/api/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { isObject } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

export type AvatarOperation = { operation: 'set'; avatarImage: string } | { operation: 'delete' };
export type AvatarMutationResult =
	| { status: 'success'; avatarUrl: string | null }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'forbidden'
				| 'validation-error'
				| 'identity-mismatch'
				| 'error';
	  };

const validAvatarUrl = (value: unknown): value is string | null => {
	if (value === null || value === '') return true;
	if (typeof value !== 'string') return false;
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
	} catch {
		return false;
	}
};

// Canonical base64 validation in O(n) time and O(1) auxiliary space.
// The Action validates PNG contents; this boundary does not decode the image again.
const validAvatarBase64 = (value: unknown): value is string => {
	const maxBytes = 5 * 1024 * 1024;
	if (
		typeof value !== 'string' ||
		value.length === 0 ||
		value.length % 4 !== 0 ||
		value.length > 4 * Math.ceil(maxBytes / 3)
	)
		return false;
	const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
	if ((value.length / 4) * 3 - padding > maxBytes) return false;
	const dataLength = value.length - padding;
	let last = 0;
	for (let index = 0; index < dataLength; index++) {
		const code = value.charCodeAt(index);
		if (code >= 65 && code <= 90) last = code - 65;
		else if (code >= 97 && code <= 122) last = code - 71;
		else if (code >= 48 && code <= 57) last = code + 4;
		else if (code === 43) last = 62;
		else if (code === 47) last = 63;
		else return false;
	}
	// RFC 4648: unused low bits must be zero for a canonical final quantum.
	return padding === 0 || (last & (padding === 2 ? 15 : 3)) === 0;
};

// Must be invoked from a writable Next.js context. Never expose a generic user update API.
export const mutateOwnAvatar = async (input: AvatarOperation): Promise<AvatarMutationResult> => {
	if (!isObject(input)) return { status: 'validation-error' };
	const setting = input.operation === 'set';
	if (
		(!setting && input.operation !== 'delete') ||
		Object.keys(input).some(
			(key) => !['operation', ...(setting ? ['avatarImage'] : [])].includes(key),
		)
	)
		return { status: 'validation-error' };
	if (setting && !validAvatarBase64(input.avatarImage)) return { status: 'validation-error' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const { data } = session;
	try {
		const config = getAuthBackendConfig();
		const result = await backendHttp<AvatarMutationResult>({
			config,
			path: `/users/${encodeURIComponent(data.userId)}`,
			method: 'PATCH',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${data.accessToken}`,
			},
			body: JSON.stringify(setting ? { avatarImage: input.avatarImage } : { avatarUrl: '' }),
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 403) return { status: 'forbidden' };
				if (response.status !== 200) return { status: 'error' };
				const value: unknown = await response.json();
				if (!isObject(value) || typeof value.id !== 'string' || !validAvatarUrl(value.avatarUrl))
					return { status: 'error' };
				if (value.id !== data.userId) return { status: 'identity-mismatch' };
				if ((setting && !value.avatarUrl) || (!setting && value.avatarUrl))
					return { status: 'error' };
				return { status: 'success', avatarUrl: value.avatarUrl || null };
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
