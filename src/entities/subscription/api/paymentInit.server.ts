import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { PaymentInitInput, PaymentInitResult } from '../model/types/paymentInit';

// Same email rule as the React subscription agreement form; do not normalize input.
const emailRule = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const parsePaymentInitInput = (value: unknown): PaymentInitInput | null => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
	const input = value as Record<string, unknown>;
	if (
		Object.keys(input).length !== 4 ||
		!['tariffId', 'email', 'isOfferAgreed', 'isConsentAgreed'].every((key) =>
			Object.hasOwn(input, key),
		) ||
		typeof input.tariffId !== 'number' ||
		!Number.isSafeInteger(input.tariffId) ||
		input.tariffId <= 0 ||
		typeof input.email !== 'string' ||
		!emailRule.test(input.email) ||
		input.isOfferAgreed !== true ||
		input.isConsentAgreed !== true
	)
		return null;
	return {
		tariffId: input.tariffId,
		email: input.email,
		isOfferAgreed: true,
		isConsentAgreed: true,
	};
};
const trustedPaymentUrl = (value: string): boolean => {
	try {
		// URL parsing alone tolerates whitespace and backslashes; reject ambiguous input.
		if (
			!value.startsWith('https://') ||
			/[\s\\]/.test(value) ||
			[...value].some(
				(character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
			)
		)
			return false;
		const url = new URL(value);
		return (
			url.protocol === 'https:' &&
			url.hostname === 'securepay.tinkoff.ru' &&
			!url.username &&
			!url.password &&
			!url.port
		);
	} catch {
		return false;
	}
};
// This GET creates a bank order. Never retry, replay, cache or fetch its returned URL.
export const requestPaymentInit = async (
	input: PaymentInitInput,
	credentials: { accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<PaymentInitResult> => {
	const parsed = parsePaymentInitInput(input);
	if (!parsed) return { status: 'invalid-input' };
	if (
		!config.allowedOrigins.includes(config.apiOrigin) ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
	)
		return { status: 'error' };
	try {
		const result = await backendHttp<PaymentInitResult>({
			config,
			path: `/subscriptions/${parsed.tariffId}/payment/init?${new URLSearchParams({ email: parsed.email })}`,
			method: 'GET',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 45000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 200) {
					const paymentUrl = await response.text();
					return trustedPaymentUrl(paymentUrl)
						? { status: 'success', paymentUrl }
						: { status: 'outcome-unknown' };
				}
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
						/* Generic forbidden is not a verification or logout signal. */
					}
					return { status: 'forbidden' };
				}
				if (response.status === 404) return { status: 'not-available' };
				if (response.status === 409) return { status: 'conflict' };
				if (response.status === 400) return { status: 'error' };
				return { status: 'outcome-unknown' };
			},
		});
		return result.status === 'response' ? result.value : { status: 'outcome-unknown' };
	} catch {
		return { status: 'outcome-unknown' };
	}
};
