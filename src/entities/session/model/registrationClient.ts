'use client';

import type { RegistrationErrors, RegistrationValues } from './registration';
import type { WebSession } from './session';

export type RegistrationResult =
	| { ok: true; session: WebSession; returnUrl: string }
	| { ok: false; error: string; fields?: RegistrationErrors };

export const registerAccount = async (
	values: RegistrationValues,
	returnPage?: string,
): Promise<RegistrationResult> => {
	const operation = async (): Promise<RegistrationResult> => {
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			cache: 'no-store',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...values, returnPage }),
		});
		if (!response.ok) {
			const body = (await response.json()) as { error?: string; fields?: RegistrationErrors };
			return { ok: false, error: body.error ?? 'REGISTRATION_UNAVAILABLE', fields: body.fields };
		}
		const body = (await response.json()) as { session: WebSession; returnUrl: string };
		return { ok: true, session: body.session, returnUrl: body.returnUrl };
	};
	// Как в AUTH-01: только локальная координация browser tabs, без distributed guarantee.
	return navigator.locks ? navigator.locks.request('yh-web-session', operation) : operation();
};
