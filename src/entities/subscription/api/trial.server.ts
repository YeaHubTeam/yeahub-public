import 'server-only';

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
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const url = new URL('/subscriptions/trial', config.apiOrigin);
		const request = async (): Promise<TrialResult> => {
			const response = await fetch(url, {
				method: 'GET',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
				headers: { Authorization: `Bearer ${credentials.accessToken}` },
			});
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
		};
		return await Promise.race([
			request(),
			new Promise<TrialResult>((resolve) => {
				timer = setTimeout(() => {
					controller.abort();
					resolve({ status: 'outcome-unknown' });
				}, 5000);
			}),
		]);
	} catch {
		return { status: 'outcome-unknown' };
	} finally {
		clearTimeout(timer);
	}
};
