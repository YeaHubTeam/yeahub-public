import 'server-only';

import type { SubscriptionCancellationResult } from '../model/types/cancelSubscription';

// Same UUID syntax as profile management and backend ParseUUIDPipe (all).
export const isCancellationSubscriptionId = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

type TransportResult =
	| { status: 'success' }
	| Exclude<SubscriptionCancellationResult, { status: 'success' }>;
// HTTP 200 only confirms transport completion. Auth composition must read back state.
export const requestSubscriptionCancellation = async (
	subscriptionId: number,
	credentials: { userId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<TransportResult> => {
	if (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0)
		return { status: 'invalid-input' };
	if (
		!credentials.userId ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken) ||
		!config.allowedOrigins.includes(config.apiOrigin)
	)
		return { status: 'error' };
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const request = async (): Promise<TransportResult> => {
			const response = await fetch(new URL('/subscriptions/users', config.apiOrigin), {
				method: 'DELETE',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
				headers: {
					Authorization: `Bearer ${credentials.accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ userId: credentials.userId, subscriptionId }),
			});
			if (response.status === 200) return { status: 'success' };
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) {
				try {
					const value: unknown = await response.json();
					if (
						typeof value === 'object' &&
						value !== null &&
						'message' in value &&
						value.message === 'auth.user.verified'
					)
						return { status: 'verification-required' };
				} catch {
					/* An unspecified 403 remains forbidden. */
				}
				return { status: 'forbidden' };
			}
			if (response.status === 404) return { status: 'not-available' };
			if (response.status === 409) return { status: 'conflict' };
			if (response.status === 400) return { status: 'error' };
			return { status: 'outcome-unknown' };
		};
		return await Promise.race([
			request(),
			new Promise<TransportResult>((resolve) => {
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
