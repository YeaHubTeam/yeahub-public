import { NextRequest } from 'next/server';

import 'server-only';

import { validateRegistration } from '../model/registration';
import { safeReturnUrl } from '../model/session';
import {
	credentialsFromResponse,
	json,
	readSession,
	setCredentials,
	trustedMutation,
	upstream,
} from './transport';

export const register = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		if (!request.headers.get('content-type')?.startsWith('application/json'))
			return json({ error: 'INVALID_REQUEST' }, 415);
		const reader = request.body?.getReader();
		if (!reader) return json({ error: 'INVALID_REQUEST' }, 400);
		let bytes = 0;
		const chunks: Uint8Array[] = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			bytes += value.byteLength;
			if (bytes > 8192) {
				await reader.cancel();
				return json({ error: 'INVALID_REQUEST' }, 413);
			}
			chunks.push(value);
		}
		let body: unknown;
		try {
			body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
		} catch {
			return json({ error: 'INVALID_REQUEST' }, 400);
		}
		const { values, errors } = validateRegistration(body);
		if (!values) return json({ error: 'VALIDATION_FAILED', fields: errors }, 400);
		// Только поля формы/DTO: roles, userId, returnPage и неизвестные поля upstream не уходят.
		const result = await upstream('signUp', undefined, values);
		if (result.status === 409)
			return json({ error: 'ACCOUNT_CONFLICT', fields: { email: 'accountConflict' } }, 409);
		if (result.status === 400 || result.status === 422)
			return json({ error: 'VALIDATION_FAILED' }, 400);
		if (result.status === 429) return json({ error: 'TRY_LATER' }, 429);
		if (!result.ok) return json({ error: 'REGISTRATION_UNAVAILABLE' }, 502);
		try {
			const credentials = await credentialsFromResponse(result);
			const session = await readSession(credentials.access);
			if (!session) throw new Error('AUTH_SESSION');
			const returnPage = (body as Record<string, unknown>).returnPage;
			return setCredentials(
				json({ session, returnUrl: safeReturnUrl(returnPage) }, 201),
				credentials,
			);
		} catch {
			// Аккаунт уже создан. Не предлагаем автоматически повторить signup.
			return json({ error: 'REGISTRATION_SESSION_FAILED' }, 502);
		}
	} catch {
		return json({ error: 'REGISTRATION_UNAVAILABLE' }, 503);
	}
};
