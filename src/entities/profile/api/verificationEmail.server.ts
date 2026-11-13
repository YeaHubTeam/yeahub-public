import 'server-only';

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
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			!credentials.userId ||
			!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
		)
			return { status: 'error' };
		const request = async (): Promise<VerificationEmailResult> => {
			const response = await fetch(
				new URL(
					`/auth/send-verification-email/${encodeURIComponent(credentials.userId)}`,
					config.apiOrigin,
				),
				{
					method: 'GET',
					cache: 'no-store',
					redirect: 'manual',
					credentials: 'omit',
					signal: controller.signal,
					headers: { Authorization: `Bearer ${credentials.accessToken}` },
				},
			);
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
		};
		const timeout = new Promise<VerificationEmailResult>((resolve) => {
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
