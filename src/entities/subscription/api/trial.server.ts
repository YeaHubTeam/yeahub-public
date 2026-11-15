import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { TrialResult } from '../model/types/trial';

// This GET changes backend state: explicit invocation only, never retry or replay it.
export const requestTrial = async (
	credentials: { accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<TrialResult> => {
	if (
		!config.allowedOrigins.includes(config.apiOrigin) ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
	)
		return { status: 'error' };
	try {
		const result = await backendHttp<TrialResult>({
			config,
			path: '/subscriptions/trial',
			method: 'GET',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 200) return { status: 'success' };
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 403) {
					try {
						const body: unknown = await response.json();
						if (
							typeof body === 'object' &&
							body !== null &&
							'message' in body &&
							body.message === 'auth.user.verified'
						)
							return { status: 'verification-required' };
					} catch {
						/* A generic 403 remains forbidden. */
					}
					return { status: 'forbidden' };
				}
				if (response.status === 404) return { status: 'error' };
				if (response.status === 409) return { status: 'conflict' };
				return { status: 'outcome-unknown' };
			},
		});
		return result.status === 'response' ? result.value : { status: 'outcome-unknown' };
	} catch {
		return { status: 'outcome-unknown' };
	}
};
