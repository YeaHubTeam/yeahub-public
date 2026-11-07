import { NextRequest } from 'next/server';

import 'server-only';

import { safeReturnUrl } from '../model/session';
import { forgetRotation, rotate } from './rotation';
import {
	ACCESS_COOKIE,
	REFRESH_COOKIE,
	clearSession,
	credentialsFromResponse,
	json,
	readSession,
	setCredentials,
	trustedMutation,
	upstream,
} from './transport';

export const login = async (request: NextRequest) => {
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
		const raw = Buffer.concat(chunks).toString('utf8');
		let body: Record<string, unknown>;
		try {
			body = JSON.parse(raw) as Record<string, unknown>;
		} catch {
			return json({ error: 'INVALID_REQUEST' }, 400);
		}
		if (
			!body ||
			typeof body.username !== 'string' ||
			typeof body.password !== 'string' ||
			!body.username ||
			!body.password ||
			body.username.length > 320 ||
			body.password.length > 1024
		) {
			return json({ error: 'INVALID_REQUEST' }, 400);
		}
		const result = await upstream('login', undefined, {
			username: body.username.trim(),
			password: body.password,
		});
		if (result.status === 401 || result.status === 400)
			return json({ error: 'INVALID_CREDENTIALS' }, 401);
		if (result.status === 429) return json({ error: 'TRY_LATER' }, 429);
		if (!result.ok) return json({ error: 'AUTH_UNAVAILABLE' }, 502);
		const credentials = await credentialsFromResponse(result);
		const session = await readSession(credentials.access);
		if (!session) return json({ error: 'INVALID_CREDENTIALS' }, 401);
		return setCredentials(
			json({ session, returnUrl: safeReturnUrl(body.returnPage) }),
			credentials,
		);
	} catch {
		return json({ error: 'AUTH_UNAVAILABLE' }, 503);
	}
};

export const session = async (request: NextRequest) => {
	try {
		const current = await readSession(request.cookies.get(ACCESS_COOKIE)?.value);
		return current ? json({ session: current }) : json({ session: null }, 401);
	} catch {
		return json({ error: 'AUTH_UNAVAILABLE' }, 503);
	}
};

export const logout = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		let token = request.cookies.get(ACCESS_COOKIE)?.value;
		const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
		// Refresh для logout также ограничен одной попыткой.
		if (refreshToken) {
			try {
				if (!(await readSession(token))) token = (await rotate(refreshToken)).access;
			} catch {
				token = undefined;
			}
			forgetRotation(refreshToken);
		}
		let revoked = !token && !refreshToken;
		try {
			if (token) revoked = (await upstream('logout', token)).ok;
		} catch {
			revoked = false;
		}
		return clearSession(json({ session: null, revoked }, revoked ? 200 : 502));
	} catch {
		return json({ error: 'AUTH_UNAVAILABLE' }, 503);
	}
};

export const refresh = async (request: NextRequest) => {
	try {
		if (!trustedMutation(request)) return json({ error: 'ORIGIN_DENIED' }, 403);
		const token = request.cookies.get(REFRESH_COOKIE)?.value;
		if (!token) return clearSession(json({ error: 'SESSION_EXPIRED' }, 401));
		try {
			const credentials = await rotate(token);
			const current = await readSession(credentials.access);
			if (!current) throw new Error('AUTH_EXPIRED');
			return setCredentials(json({ session: current }), credentials);
		} catch {
			return clearSession(json({ error: 'SESSION_EXPIRED' }, 401));
		}
	} catch {
		return json({ error: 'AUTH_UNAVAILABLE' }, 503);
	}
};
