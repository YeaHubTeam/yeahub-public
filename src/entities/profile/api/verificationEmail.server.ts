import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { ProfileBackendConfig } from './profile.server';

export type VerificationEmailResult = {
	status:
		| 'success'
		| 'unauthenticated'
		| 'refresh-required'
		| 'forbidden'
		| 'rate-limited'
		| 'already-verified'
		| 'error';
};

// This GET sends email: never cache, prefetch, or retry it automatically.
export const sendVerificationEmail = async (
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
): Promise<VerificationEmailResult> => {
	try {
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			!credentials.userId ||
			!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
		)
			return { status: 'error' };
		const result = await backendHttp<VerificationEmailResult>({
			config,
			path: `/auth/send-verification-email/${encodeURIComponent(credentials.userId)}`,
			method: 'GET',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 429) return { status: 'rate-limited' };
				if (![200, 400, 403].includes(response.status)) return { status: 'error' };
				let data: unknown;
				try {
					data = await response.json();
				} catch {
					return { status: response.status === 403 ? 'forbidden' : 'error' };
				}
				const message =
					typeof data === 'object' && data !== null && !Array.isArray(data) && 'message' in data
						? data.message
						: undefined;
				if (response.status === 200)
					return { status: message === 'Verification email was sent' ? 'success' : 'error' };
				if (response.status === 400 && message === 'user.user.already_verified')
					return { status: 'already-verified' };
				if (response.status === 403)
					return {
						status: message === 'user.user.email.limited_period' ? 'rate-limited' : 'forbidden',
					};
				return { status: 'error' };
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
