'use server';

import 'server-only';

import { getAuthBackendConfig } from '@/shared/config/authBackend.server';
import { emailRule } from '@/shared/libs';

export type PasswordResetResult =
	| { status: 'success' }
	| { status: 'validation-error' }
	| { status: 'error' };

export async function sendPasswordResetEmail(email: string): Promise<PasswordResetResult> {
	if (typeof email !== 'string') return { status: 'validation-error' };
	const normalized = email.trim();
	if (!normalized || normalized.length > 254 || !emailRule.test(normalized))
		return { status: 'validation-error' };

	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const { apiOrigin, allowedOrigins } = getAuthBackendConfig();
		if (!allowedOrigins.includes(apiOrigin)) return { status: 'error' };
		const url = new URL('/auth/send-reset-password', apiOrigin);
		url.search = new URLSearchParams({ email: normalized }).toString();
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(() => {
				controller.abort();
				reject(new Error('Password reset request timed out'));
			}, 5000);
		});
		const response = await Promise.race([
			fetch(url, {
				method: 'GET',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
			}),
			timeout,
		]);
		return { status: response.status === 200 ? 'success' : 'error' };
	} catch {
		// Never expose backend errors, email, response bodies or request URLs.
		return { status: 'error' };
	} finally {
		clearTimeout(timer);
	}
}
