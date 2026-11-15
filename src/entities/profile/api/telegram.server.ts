import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { TelegramLoginPayload, TelegramMutationResult } from '../model/types/telegram';
import type { ProfileBackendConfig } from './profile.server';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const fields = ['id', 'first_name', 'auth_date', 'hash', 'last_name', 'username', 'photo_url'];
// Shape/size checks only: preserve every signed value; backend owns HMAC and freshness checks.
export const parseTelegramPayload = (value: unknown): TelegramLoginPayload | null => {
	if (
		!object(value) ||
		Object.keys(value).some((key) => !fields.includes(key)) ||
		!['id', 'first_name', 'auth_date', 'hash'].every((key) => Object.hasOwn(value, key))
	)
		return null;
	if (
		!Number.isSafeInteger(value.id) ||
		typeof value.id !== 'number' ||
		value.id <= 0 ||
		!Number.isSafeInteger(value.auth_date) ||
		typeof value.auth_date !== 'number' ||
		value.auth_date <= 0 ||
		typeof value.hash !== 'string' ||
		!/^[a-fA-F0-9]{64}$/.test(value.hash) ||
		typeof value.first_name !== 'string' ||
		!value.first_name ||
		Buffer.byteLength(value.first_name, 'utf8') > 1024
	)
		return null;
	const payload: TelegramLoginPayload = {
		id: value.id,
		first_name: value.first_name,
		auth_date: value.auth_date,
		hash: value.hash,
	};
	for (const key of ['last_name', 'username', 'photo_url'] as const) {
		if (!Object.hasOwn(value, key)) continue;
		const field = value[key];
		if (
			typeof field !== 'string' ||
			Buffer.byteLength(field, 'utf8') >
				(key === 'photo_url' ? 4096 : key === 'username' ? 256 : 1024)
		)
			return null;
		if (key === 'photo_url') {
			try {
				const url = new URL(field);
				if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
					return null;
			} catch {
				return null;
			}
		}
		payload[key] = field;
	}
	if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 8192) return null;
	return payload;
};

export const mutateTelegram = async (
	operation: { type: 'link'; payload: unknown } | { type: 'unlink' },
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
): Promise<TelegramMutationResult> => {
	const payload = operation.type === 'link' ? parseTelegramPayload(operation.payload) : null;
	if (operation.type === 'link' && !payload) return { status: 'validation-error' };
	try {
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			!credentials.userId ||
			!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
		)
			return { status: 'error' };
		const result = await backendHttp<TelegramMutationResult>({
			config,
			path: `/users/${operation.type}-telegram`,
			method: 'POST',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				...(payload ? { 'Content-Type': 'application/json' } : {}),
			},
			...(payload ? { body: JSON.stringify(payload) } : {}),
			decode: async (response) => {
				if (![201, 400, 401, 403, 404].includes(response.status)) return { status: 'error' };
				let data: unknown;
				try {
					data = await response.json();
				} catch {
					return { status: 'error' };
				}
				if (response.status !== 201) {
					const message = object(data) ? data.message : undefined;
					if (response.status === 401) {
						if (message === 'auth.telegram.invalid_data')
							return { status: 'invalid-telegram-data' };
						if (message === 'auth.telegram.data_outdated')
							return { status: 'outdated-telegram-data' };
						return { status: message === 'auth.auth.unauthorized' ? 'unauthenticated' : 'error' };
					}
					if (response.status === 403) {
						switch (message) {
							case 'auth.telegram.verify_denied':
								return { status: 'invalid-telegram-data' };
							case 'user.telegram.already_linked':
								return { status: 'already-linked' };
							case 'user.telegram.linked_to_another_user':
								return { status: 'linked-to-another-user' };
							case 'user.telegram.not_linked':
								return { status: 'not-linked' };
							case 'user.user.has_no_another_way_to_login':
								return { status: 'unlink-forbidden' };
							default:
								return { status: 'forbidden' };
						}
					}
					return { status: response.status === 404 ? 'not-found' : 'error' };
				}
				if (!object(data) || typeof data.id !== 'string' || !data.id) return { status: 'error' };
				if (data.id !== credentials.userId) return { status: 'identity-mismatch' };
				const username = data.telegramUsername;
				if (username !== undefined && username !== null && typeof username !== 'string')
					return { status: 'error' };
				if (operation.type === 'unlink' && username !== null) return { status: 'error' };
				if (payload?.username !== undefined && username !== payload.username)
					return { status: 'error' };
				return { status: 'success', telegramUsername: username || null };
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
