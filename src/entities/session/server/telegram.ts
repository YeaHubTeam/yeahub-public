import { NextRequest } from 'next/server';

import 'server-only';

import { resolveAuthUrls } from '../../../shared/config/urlEnvironment';
import { safeReturnUrl } from '../model/session';
import { configuredTelegramBot, parseTelegramPayload } from '../model/telegram';
import {
	credentialsFromResponse,
	json,
	readSession,
	setCredentials,
	trustedMutation,
	upstream,
} from './transport';

export const getTelegramBotName = () =>
	configuredTelegramBot(process.env.TELEGRAM_BOT_NAME, resolveAuthUrls(process.env).webOrigin);

export const telegramLogin = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		if (!getTelegramBotName()) return json({ error: 'TELEGRAM_NOT_CONFIGURED' }, 503);
		if (!request.headers.get('content-type')?.startsWith('application/json'))
			return json({ error: 'INVALID_REQUEST' }, 415);
		const reader = request.body?.getReader();
		if (!reader) return json({ error: 'INVALID_REQUEST' }, 400);
		const chunks: Uint8Array[] = [];
		let bytes = 0;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			bytes += value.byteLength;
			if (bytes > 8192) {
				await reader.cancel();
				return json({ error: 'INVALID_REQUEST' }, 413);
			}
			chunks.push(value);
		}
		let body: Record<string, unknown>;
		try {
			const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
			if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
				return json({ error: 'INVALID_REQUEST' }, 400);
			body = parsed as Record<string, unknown>;
		} catch {
			return json({ error: 'INVALID_REQUEST' }, 400);
		}
		const payload = parseTelegramPayload(body.payload);
		if (!payload) return json({ error: 'TELEGRAM_INVALID' }, 400);
		const now = Math.floor(Date.now() / 1000);
		if (payload.auth_date < now - 86400) return json({ error: 'TELEGRAM_EXPIRED' }, 401);
		if (payload.auth_date > now + 60) return json({ error: 'TELEGRAM_INVALID' }, 400);
		const response = await upstream('telegram', undefined, payload);
		if (response.status === 401) {
			const error = (await response.json().catch(() => null)) as { message?: unknown } | null;
			return json(
				{
					error:
						error?.message === 'auth.telegram.data_outdated'
							? 'TELEGRAM_EXPIRED'
							: 'TELEGRAM_INVALID',
				},
				401,
			);
		}
		if (response.status === 400 || response.status === 422)
			return json({ error: 'TELEGRAM_INVALID' }, 400);
		if (response.status === 403) return json({ error: 'TELEGRAM_DENIED' }, 403);
		if (response.status === 409) return json({ error: 'ACCOUNT_CONFLICT' }, 409);
		if (response.status === 429) return json({ error: 'TRY_LATER' }, 429);
		if (!response.ok) return json({ error: 'AUTH_UNAVAILABLE' }, 502);
		const credentials = await credentialsFromResponse(response);
		const session = await readSession(credentials.access);
		if (!session) return json({ error: 'AUTH_UNAVAILABLE' }, 502);
		return setCredentials(
			json({ session, returnUrl: safeReturnUrl(body.returnPage) }),
			credentials,
		);
	} catch {
		return json({ error: 'AUTH_UNAVAILABLE' }, 503);
	}
};
