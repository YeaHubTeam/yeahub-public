import { NextRequest, NextResponse } from 'next/server';

import 'server-only';

import { resolveAuthUrls } from '../../../shared/config/urlEnvironment';
import type { WebSession } from '../model/session';

export const ACCESS_COOKIE = 'yh_web_access';
export const REFRESH_COOKIE = 'yh_web_refresh';
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Origin' };

export const json = (body: unknown, status = 200) =>
	NextResponse.json(body, { status, headers: privateHeaders });

export const configuration = () => {
	const urls = resolveAuthUrls(process.env);
	const api = new URL(urls.apiUrl || 'invalid:');
	const web = new URL(urls.webOrigin || 'invalid:');
	const local = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
	if (
		!['http:', 'https:'].includes(api.protocol) ||
		!['http:', 'https:'].includes(web.protocol) ||
		api.username ||
		api.password ||
		web.username ||
		web.password ||
		api.search ||
		api.hash ||
		web.pathname !== '/' ||
		web.search ||
		web.hash ||
		(process.env.NODE_ENV !== 'production' && (!local(api) || !local(web))) ||
		(process.env.NODE_ENV === 'production' &&
			(api.protocol !== 'https:' || web.protocol !== 'https:'))
	)
		throw new Error('AUTH_CONFIGURATION');
	return { api, web };
};

export const trustedMutation = (request: NextRequest): boolean => {
	const { web } = configuration();
	return (
		request.headers.get('origin') === web.origin &&
		request.headers.get('sec-fetch-site') !== 'cross-site'
	);
};

// Только явно перечисленные auth endpoints. Redirect не переносит credentials на другой host.
export const upstream = (
	path: 'login' | 'signUp' | 'profile' | 'logout' | 'refresh',
	token?: string,
	body?: unknown,
	refreshToken?: string,
) => {
	const { api } = configuration();
	return fetch(new URL(`auth/${path}`, `${api.href.replace(/\/$/, '')}/`), {
		method: path === 'login' || path === 'signUp' ? 'POST' : 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(refreshToken ? { Cookie: `refresh_token=${encodeURIComponent(refreshToken)}` } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(10000),
	});
};

const object = (value: unknown): Record<string, unknown> => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('AUTH_CONTRACT');
	return value as Record<string, unknown>;
};

// Allowlist вместо пересылки backend DTO: новые поля/credentials не попадут в browser JSON.
export const publicSession = (value: unknown): WebSession => {
	const user = object(value);
	if (
		typeof user.id !== 'string' ||
		typeof user.username !== 'string' ||
		typeof user.email !== 'string'
	) {
		throw new Error('AUTH_CONTRACT');
	}
	const profiles = (Array.isArray(user.profiles) ? user.profiles : []).map((entry: unknown) => {
		const profile = object(entry);
		if (typeof profile.id !== 'string') throw new Error('AUTH_CONTRACT');
		return {
			id: profile.id,
			specializationId:
				typeof profile.specializationId === 'number' ? profile.specializationId : null,
			isActive: profile.isActive === true,
		};
	});
	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			isVerified: user.isVerified === true,
		},
		roles: (Array.isArray(user.userRoles) ? user.userRoles : []).flatMap((entry: unknown) => {
			const role = object(entry);
			return typeof role.name === 'string' ? [role.name] : [];
		}),
		profiles,
		activeProfile: profiles.find((profile) => profile.isActive) ?? null,
	};
};

export const clearSession = (response: NextResponse) => {
	for (const name of [ACCESS_COOKIE, REFRESH_COOKIE])
		response.cookies.set(name, '', {
			httpOnly: true,
			secure: configuration().web.protocol === 'https:',
			sameSite: 'lax',
			path: '/',
			maxAge: 0,
		});
	return response;
};

export const readSession = async (token?: string): Promise<WebSession | null> => {
	if (!token) return null;
	const response = await upstream('profile', token);
	if (response.status === 401 || response.status === 403) return null;
	if (!response.ok) throw new Error('AUTH_UPSTREAM');
	return publicSession(await response.json());
};

export interface Credentials {
	access: string;
	refresh: string;
}

export const credentialsFromResponse = async (response: Response): Promise<Credentials> => {
	const data = (await response.json()) as { access_token?: unknown };
	const cookie = response.headers
		.getSetCookie()
		.find((entry) => entry.startsWith('refresh_token='));
	const encoded = cookie?.split(';')[0].slice('refresh_token='.length);
	if (
		typeof data.access_token !== 'string' ||
		!data.access_token ||
		data.access_token.length > 3800 ||
		!encoded
	) {
		throw new Error('AUTH_CONTRACT');
	}
	const refresh = decodeURIComponent(encoded);
	if (!refresh || refresh.length > 3800 || /[\s;\r\n]/.test(refresh))
		throw new Error('AUTH_CONTRACT');
	return { access: data.access_token, refresh };
};

export const setCredentials = (response: NextResponse, credentials: Credentials) => {
	const options = {
		httpOnly: true,
		secure: configuration().web.protocol === 'https:',
		sameSite: 'lax' as const,
		path: '/',
	};
	response.cookies.set(ACCESS_COOKIE, credentials.access, options);
	// Срок ограничен backend JWT (7 дней); cookie не продлевает валидность токена.
	response.cookies.set(REFRESH_COOKIE, credentials.refresh, {
		...options,
		maxAge: 7 * 24 * 60 * 60,
	});
	return response;
};
