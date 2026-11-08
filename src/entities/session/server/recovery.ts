import { NextRequest } from 'next/server';

import { createHash } from 'node:crypto';
import 'server-only';

import { recoveryEmailError, recoveryPasswordErrors, validRecoveryToken } from '../model/recovery';
import { authPageUrl } from '../model/session';
import { RECOVERY_COOKIE, recoveryCookieOptions } from './recoveryLink';
import {
	clearSession,
	configuration,
	credentialsFromResponse,
	json,
	setCredentials,
	trustedMutation,
	upstream,
} from './transport';

// A public, non-authorizing fingerprint binds each form to its HttpOnly recovery link.
// A second tab opening another link must not silently change the first form's account.
export const recoveryContext = (token: string | undefined): string | undefined =>
	validRecoveryToken(token) ? createHash('sha256').update(token).digest('hex') : undefined;

const readBody = async (request: NextRequest): Promise<Record<string, unknown> | null> => {
	if (!request.headers.get('content-type')?.startsWith('application/json')) return null;
	const reader = request.body?.getReader();
	if (!reader) return null;
	const decoder = new TextDecoder();
	let content = '',
		bytes = 0;
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			bytes += value.byteLength;
			if (bytes > 4096) {
				await reader.cancel();
				return null;
			}
			content += decoder.decode(value, { stream: true });
		}
		const body: unknown = JSON.parse(content + decoder.decode());
		return body && typeof body === 'object' && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
};
const clearRecovery = (response: ReturnType<typeof json>) => {
	response.cookies.set(RECOVERY_COOKIE, '', {
		...recoveryCookieOptions(configuration().web.protocol === 'https:'),
		maxAge: 0,
	});
	return response;
};
export const forgotPassword = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		const body = await readBody(request);
		if (!body || recoveryEmailError(body.email)) return json({ error: 'VALIDATION_FAILED' }, 400);
		const response = await upstream('send-reset-password', undefined, undefined, undefined, {
			email: body.email as string,
		});
		// No account existence information or arbitrary upstream body is forwarded.
		if (response.status === 403 || response.status === 429)
			return json({ error: 'TRY_LATER' }, 429);
		if (!response.ok) return json({ error: 'RECOVERY_UNAVAILABLE' }, 502);
		return json({ ok: true });
	} catch {
		return json({ error: 'RECOVERY_UNAVAILABLE' }, 503);
	}
};
export const resetPassword = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		const token = request.cookies.get(RECOVERY_COOKIE)?.value;
		if (!validRecoveryToken(token))
			return clearRecovery(json({ error: 'RECOVERY_LINK_INVALID' }, 400));
		const body = await readBody(request);
		if (
			!body ||
			typeof body.password !== 'string' ||
			typeof body.passwordConfirm !== 'string' ||
			Object.keys(
				recoveryPasswordErrors({ password: body.password, passwordConfirm: body.passwordConfirm }),
			).length
		)
			return json({ error: 'VALIDATION_FAILED' }, 400);
		if (body.context !== recoveryContext(token))
			return json({ error: 'RECOVERY_LINK_INVALID' }, 400);
		const response = await upstream('reset-password', undefined, {
			password: body.password,
			passwordConfirm: body.passwordConfirm,
			token,
		});
		if (
			response.status === 401 ||
			response.status === 403 ||
			response.status === 404 ||
			response.status === 410
		)
			return clearRecovery(json({ error: 'RECOVERY_LINK_INVALID' }, 400));
		if (response.status === 400 || response.status === 422)
			return json({ error: 'VALIDATION_FAILED' }, 400);
		if (response.status === 429) return json({ error: 'TRY_LATER' }, 429);
		if (!response.ok) return json({ error: 'RECOVERY_UNAVAILABLE' }, 502);
		// Backend rotates credentials on reset, just as React's original automatic sign-in.
		// No profile call here: the password has already changed; session restores through AUTH-01.
		try {
			const credentials = await credentialsFromResponse(response);
			return clearRecovery(
				setCredentials(
					json({ ok: true, loginUrl: authPageUrl('login', body.returnPage) }),
					credentials,
				),
			);
		} catch {
			return clearRecovery(
				clearSession(
					json({
						ok: true,
						sessionEstablished: false,
						loginUrl: authPageUrl('login', body.returnPage),
					}),
				),
			);
		}
	} catch {
		return json({ error: 'RECOVERY_UNAVAILABLE' }, 503);
	}
};
