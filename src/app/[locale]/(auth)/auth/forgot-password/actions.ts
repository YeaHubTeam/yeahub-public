'use server';

import 'server-only';

import { backendHttp } from '@/shared/api/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';
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

	try {
		const config = getAuthBackendConfig();
		const query = new URLSearchParams({ email: normalized });
		const result = await backendHttp<PasswordResetResult>({
			config,
			path: `/auth/send-reset-password?${query}`,
			method: 'GET',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			decode: (response) =>
				Promise.resolve({ status: response.status === 200 ? 'success' : 'error' }),
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		// Never expose backend errors, email, response bodies or request URLs.
		return { status: 'error' };
	}
}
