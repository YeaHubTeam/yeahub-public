'use server';

import 'server-only';

import { getAuthBackendConfig } from '@/shared/config/authBackend.server';
import { passwordRules } from '@/shared/libs';

type ResetPasswordResult =
	| { status: 'success' }
	| { status: 'validation-error' }
	| { status: 'invalid-token' }
	| { status: 'error' };

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export async function resetPassword(
	token: string,
	password: string,
	passwordConfirm: string,
): Promise<ResetPasswordResult> {
	if (typeof token !== 'string' || !/^[a-fA-F0-9]{40}$/.test(token))
		return { status: 'invalid-token' };
	if (
		![password, passwordConfirm].every(
			(value) =>
				typeof value === 'string' &&
				value.length >= 8 &&
				value.length <= 255 &&
				passwordRules.test(value),
		) ||
		password !== passwordConfirm
	)
		return { status: 'validation-error' };

	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const { apiOrigin, allowedOrigins } = getAuthBackendConfig();
		if (!allowedOrigins.includes(apiOrigin)) return { status: 'error' };
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(() => {
				controller.abort();
				reject(new Error('Password reset timed out'));
			}, 5000);
		});
		const request = async (): Promise<ResetPasswordResult> => {
			const response = await fetch(new URL('/auth/reset-password', apiOrigin), {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password, passwordConfirm, token }),
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
			});
			if (![200, 400, 401].includes(response.status)) return { status: 'error' };
			const data: unknown = await response.json();
			if (!isObject(data)) return { status: 'error' };
			if (response.status === 401) {
				return {
					status:
						data.message === 'auth.user.reset_password_token.verification_failed'
							? 'invalid-token'
							: 'error',
				};
			}
			if (response.status === 400) {
				return {
					status:
						data.statusCode === 400 &&
						Array.isArray(data.message) &&
						data.message.length > 0 &&
						data.message.every((message: unknown) => typeof message === 'string')
							? 'validation-error'
							: 'error',
				};
			}
			// Check the success envelope only. Do not decode, retain or return credentials.
			return {
				status:
					typeof data.access_token === 'string' &&
					data.access_token.trim().length > 0 &&
					isObject(data.user) &&
					typeof data.user.id === 'string' &&
					data.user.id.trim().length > 0
						? 'success'
						: 'error',
			};
		};
		return await Promise.race([request(), timeout]);
	} catch {
		return { status: 'error' };
	} finally {
		clearTimeout(timer);
	}
}
