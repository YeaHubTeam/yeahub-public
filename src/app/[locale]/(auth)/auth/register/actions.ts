'use server';

import 'server-only';

import { getAuthBackendConfig } from '@/shared/config/authBackend.server';
import { emailRule, passwordRules } from '@/shared/libs';

export type RegistrationResult = {
	status: 'success' | 'validation-error' | 'conflict' | 'error';
};

export type RegistrationInput = {
	username: string;
	email: string;
	password: string;
	passwordConfirmation: string;
	privacyConsent: boolean;
	offerConsent: boolean;
	adConsent?: boolean;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export async function registerUser(input: RegistrationInput): Promise<RegistrationResult> {
	if (
		!isObject(input) ||
		typeof input.username !== 'string' ||
		input.username.trim().length < 2 ||
		input.username.trim().length > 30 ||
		typeof input.email !== 'string' ||
		!emailRule.test(input.email.trim()) ||
		typeof input.password !== 'string' ||
		input.password.length < 8 ||
		input.password.length > 255 ||
		!passwordRules.test(input.password) ||
		typeof input.passwordConfirmation !== 'string' ||
		input.passwordConfirmation !== input.password ||
		input.privacyConsent !== true ||
		input.offerConsent !== true ||
		(input.adConsent !== undefined && typeof input.adConsent !== 'boolean')
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
				reject(new Error('Registration timed out'));
			}, 5000);
		});
		const request = async (): Promise<RegistrationResult> => {
			const response = await fetch(new URL('/auth/signUp', apiOrigin), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: input.username.trim(),
					email: input.email.trim(),
					password: input.password,
				}),
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
			});
			if (response.status === 400) return { status: 'validation-error' };
			if (response.status !== 201 && response.status !== 409) return { status: 'error' };
			const data: unknown = await response.json();
			if (!isObject(data)) return { status: 'error' };
			if (response.status === 409)
				return { status: data.message === 'user.user.conflict' ? 'conflict' : 'error' };
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
		// Do not expose backend responses or exception details, or retry account creation.
		return { status: 'error' };
	} finally {
		clearTimeout(timer);
	}
}
