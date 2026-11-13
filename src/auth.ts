import { headers } from 'next/headers';

import { createActionURL, setEnvDefaults } from '@auth/core';
import type { AuthConfig } from '@auth/core';
import NextAuth from 'next-auth';
import { encode, getToken } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import 'server-only';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';
import {
	mutateTelegram,
	parseProfileEditInput,
	parseTelegramPayload,
	readHeaderProfile,
	readOwnProfile,
	readSettingsSnapshot,
	saveOwnProfile,
	sendVerificationEmail,
} from '@/entities/profile/server';
import type {
	HeaderProfileResult,
	ProfileEditResult,
	SettingsSnapshotResult,
	TelegramMutationResult,
	VerificationEmailResult,
} from '@/entities/profile/server';
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';

import { AuthRefreshError, refreshAuthCredentials } from './lib/authRefresh.server';

type BackendSession = {
	userId: string;
	username: string;
	avatarUrl: string | null;
	email?: string | null;
	accessToken: string;
	refreshToken: string;
	accessExpiresAt: number;
	refreshExpiresAt: number;
	sessionExpiresAt: number;
	refreshRetryRequired?: boolean;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isBackendSession = (value: unknown): value is BackendSession =>
	isObject(value) &&
	['userId', 'username', 'accessToken', 'refreshToken'].every(
		(key) => typeof value[key] === 'string' && value[key].length > 0,
	) &&
	(value.avatarUrl === null || typeof value.avatarUrl === 'string') &&
	(value.email === undefined || value.email === null || typeof value.email === 'string') &&
	(value.refreshRetryRequired === undefined || typeof value.refreshRetryRequired === 'boolean') &&
	['accessExpiresAt', 'refreshExpiresAt', 'sessionExpiresAt'].every(
		(key) => typeof value[key] === 'number' && Number.isSafeInteger(value[key]),
	);

// Pick only the optional, server-confirmed field; never copy client update data.
const emailField = (email: unknown): { email?: string | null } =>
	typeof email === 'string' || email === null ? { email } : {};

const deadline = (session: BackendSession) =>
	Math.min(session.refreshExpiresAt, session.sessionExpiresAt);

// Expiry metadata from a trusted backend response is not signature/session verification.
const getTokenExpiry = (token: string): number => {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) throw new Error();
		const payload: unknown = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
		if (
			!isObject(payload) ||
			typeof payload.exp !== 'number' ||
			!Number.isSafeInteger(payload.exp) ||
			payload.exp <= Math.floor(Date.now() / 1000)
		)
			throw new Error();
		return payload.exp;
	} catch {
		throw new BackendAuthError('protocol');
	}
};

const nextAuth = NextAuth(() => ({
	debug: false,
	session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
	jwt: {
		encode(params) {
			const data = params.token?.backendSession;
			// Bound the encrypted JWT itself, including rolling reads and legacy cookies.
			const remaining = isBackendSession(data)
				? Math.max(0, deadline(data) - Math.floor(Date.now() / 1000))
				: 0;
			return encode({ ...params, maxAge: Math.min(params.maxAge ?? 7 * 24 * 60 * 60, remaining) });
		},
	},
	providers: [
		Credentials({
			credentials: {
				username: { type: 'email' },
				password: { type: 'password' },
			},
			async authorize(credentials) {
				if (
					typeof credentials.username !== 'string' ||
					!credentials.username.trim() ||
					typeof credentials.password !== 'string' ||
					!credentials.password.trim()
				)
					return null;
				const backend = createBackendAuthTransport(getAuthBackendConfig());
				try {
					const result = await backend.login({
						username: credentials.username,
						password: credentials.password,
					});
					const accessExpiresAt = getTokenExpiry(result.access_token);
					const refreshExpiresAt = getTokenExpiry(result.refreshToken);
					const backendSession: BackendSession = {
						userId: result.user.id,
						username: result.user.username,
						avatarUrl: result.user.avatarUrl,
						...emailField(result.user.email),
						accessToken: result.access_token,
						refreshToken: result.refreshToken,
						accessExpiresAt,
						refreshExpiresAt,
						sessionExpiresAt: Math.min(
							refreshExpiresAt,
							Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
						),
					};
					if (!isBackendSession(backendSession)) throw new BackendAuthError('protocol');
					return { id: result.user.id, backendSession };
				} catch (error) {
					if (error instanceof BackendAuthError && error.kind === 'http' && error.status === 401)
						return null;
					throw error;
				}
			},
		}),
	],
	events: {
		async signOut(message) {
			if (!('token' in message) || !isBackendSession(message.token?.backendSession)) return;
			const controller = new AbortController();
			let timer: ReturnType<typeof setTimeout> | undefined;
			try {
				const timeout = new Promise<never>((_, reject) => {
					timer = setTimeout(() => {
						controller.abort();
						reject(new Error('Backend logout timed out'));
					}, 3000);
				});
				const backend = createBackendAuthTransport({
					...getAuthBackendConfig(),
					fetch: (input, init) => fetch(input, { ...init, signal: controller.signal }),
				});
				await Promise.race([backend.logout(message.token.backendSession.accessToken), timeout]);
			} catch {
				// Backend revocation is best effort; always allow Auth.js to clear its cookies.
			} finally {
				clearTimeout(timer);
			}
		},
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			const stored = user && 'backendSession' in user ? user.backendSession : token.backendSession;
			if (!isBackendSession(stored) || deadline(stored) <= Math.floor(Date.now() / 1000))
				return null;
			// Client data is a re-read signal only; username always comes from the verified backend.
			if (trigger === 'update' && isObject(session) && session.syncProfile === true) {
				if (stored.accessExpiresAt <= Math.floor(Date.now() / 1000)) return token;
				try {
					const result = await readOwnProfile(
						{ userId: stored.userId, accessToken: stored.accessToken },
						getAuthBackendConfig(),
					);
					if (
						result.status !== 'success' ||
						result.profile.username.length < 2 ||
						result.profile.username.length > 30
					)
						return token;
					return {
						sub: stored.userId,
						backendSession: { ...stored, username: result.profile.username },
					};
				} catch {
					return token;
				}
			}
			let data = stored;
			// Auth.js sets update only for writable operations. Client session data is ignored.
			if (trigger === 'update' && data.accessExpiresAt <= Math.floor(Date.now() / 1000) + 60) {
				try {
					const refreshed = await refreshAuthCredentials({
						refreshToken: data.refreshToken,
						expectedUserId: data.userId,
					});
					if (refreshed.user.id !== data.userId) return null;
					data = {
						userId: data.userId,
						username: refreshed.user.username,
						avatarUrl: refreshed.user.avatarUrl,
						...emailField(refreshed.user.email === undefined ? stored.email : refreshed.user.email),
						accessToken: refreshed.access_token,
						refreshToken: refreshed.refreshToken,
						accessExpiresAt: getTokenExpiry(refreshed.access_token),
						refreshExpiresAt: getTokenExpiry(refreshed.refreshToken),
						sessionExpiresAt: stored.sessionExpiresAt,
					};
				} catch (error) {
					if (
						!(error instanceof AuthRefreshError) ||
						!['network', 'backend', 'capacity'].includes(error.code)
					)
						return null;
					// Keep valid session state on transient failures; no retries in this request.
					data = { ...stored, refreshRetryRequired: true };
				}
			}
			if (!isBackendSession(data) || deadline(data) <= Math.floor(Date.now() / 1000)) return null;
			// Do not merge client session.update data, default token or provider user fields.
			return {
				sub: data.userId,
				backendSession: {
					userId: data.userId,
					username: data.username,
					avatarUrl: data.avatarUrl,
					...emailField(data.email),
					accessToken: data.accessToken,
					refreshToken: data.refreshToken,
					accessExpiresAt: data.accessExpiresAt,
					refreshExpiresAt: data.refreshExpiresAt,
					sessionExpiresAt: data.sessionExpiresAt,
					...(data.refreshRetryRequired ? { refreshRetryRequired: true } : {}),
				},
			};
		},
		session({ token }) {
			const data = token.backendSession;
			if (!isBackendSession(data) || deadline(data) <= Math.floor(Date.now() / 1000)) {
				throw new Error('Backend authentication expired or unavailable');
			}
			return {
				user: {
					id: data.userId,
					username: data.username,
					image: data.avatarUrl,
					...emailField(data.email),
				},
				expires: new Date(deadline(data) * 1000).toISOString(),
				// Identity persists for refresh; this does not make an expired access token usable.
				requiresRefresh:
					data.refreshRetryRequired === true ||
					data.accessExpiresAt <= Math.floor(Date.now() / 1000),
			};
		},
	},
}));

export const { handlers, auth, signIn, signOut } = nextAuth;

// Shared, private cookie verification for server reads and mutations.
const currentBackendSession = async () => {
	try {
		const requestHeaders = await headers();
		const config: AuthConfig = {
			providers: [],
			secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
			basePath: '/api/auth',
		};
		// Match NextAuth's environment defaults, including secret rotation.
		setEnvDefaults(process.env, config, true);
		const url = createActionURL(
			'session',
			requestHeaders.get('x-forwarded-proto') ?? 'https',
			requestHeaders,
			process.env,
			config,
		);
		// Cookie only: do not accept a request Authorization header as a session.
		const token = await getToken({
			req: { headers: new Headers({ cookie: requestHeaders.get('cookie') ?? '' }) },
			secret: config.secret ?? [],
			secureCookie: url.protocol === 'https:',
		});
		const data = token?.backendSession;
		const now = Math.floor(Date.now() / 1000);
		if (
			!isBackendSession(data) ||
			token?.sub !== data.userId ||
			typeof token.exp !== 'number' ||
			token.exp <= now ||
			deadline(data) <= now
		)
			return { status: 'unauthenticated' } as const;
		if (data.accessExpiresAt <= now) return { status: 'refresh-required' } as const;
		return { status: 'success', data } as const;
	} catch {
		return { status: 'error' } as const;
	}
};

// Server composition root: never expose credentials through the session callback.
export const getOwnProfile = async () => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readOwnProfile(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' } as const;
	}
};

// Read-only composition: reuse credential checks without exposing or changing the session.
export const getHeaderProfile = async (): Promise<HeaderProfileResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	return readHeaderProfile(
		{ userId: session.data.userId, accessToken: session.data.accessToken },
		getAuthBackendConfig(),
	);
};

// Read-only settings composition; credentials remain private to this server module.
export const getSettingsSnapshot = async (): Promise<SettingsSnapshotResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readSettingsSnapshot(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

// Explicit invocation only: never called by a render or snapshot read.
export const sendOwnVerificationEmail = async (): Promise<VerificationEmailResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await sendVerificationEmail(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const linkOwnTelegram = async (payload: unknown): Promise<TelegramMutationResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const data = parseTelegramPayload(payload);
	if (!data) return { status: 'validation-error' };
	try {
		return await mutateTelegram(
			{ type: 'link', payload: data },
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const unlinkOwnTelegram = async (): Promise<TelegramMutationResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await mutateTelegram(
			{ type: 'unlink' },
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export type AvatarOperation = { operation: 'set'; avatarImage: string } | { operation: 'delete' };
export type AvatarMutationResult =
	| { status: 'success'; avatarUrl: string | null }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'forbidden'
				| 'validation-error'
				| 'identity-mismatch'
				| 'error';
	  };

const validAvatarUrl = (value: unknown): value is string | null => {
	if (value === null || value === '') return true;
	if (typeof value !== 'string') return false;
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
	} catch {
		return false;
	}
};

const avatarTimeout = async <T>(request: (signal: AbortSignal) => Promise<T>): Promise<T> => {
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(() => {
				controller.abort();
				reject(new Error('Avatar request timed out'));
			}, 5000);
		});
		return await Promise.race([request(controller.signal), timeout]);
	} finally {
		clearTimeout(timer);
	}
};

// Canonical base64 validation in O(n) time and O(1) auxiliary space.
// The Action validates PNG contents; this boundary does not decode the image again.
const validAvatarBase64 = (value: unknown): value is string => {
	const maxBytes = 5 * 1024 * 1024;
	if (
		typeof value !== 'string' ||
		value.length === 0 ||
		value.length % 4 !== 0 ||
		value.length > 4 * Math.ceil(maxBytes / 3)
	)
		return false;
	const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
	if ((value.length / 4) * 3 - padding > maxBytes) return false;
	const dataLength = value.length - padding;
	let last = 0;
	for (let index = 0; index < dataLength; index++) {
		const code = value.charCodeAt(index);
		if (code >= 65 && code <= 90) last = code - 65;
		else if (code >= 97 && code <= 122) last = code - 71;
		else if (code >= 48 && code <= 57) last = code + 4;
		else if (code === 43) last = 62;
		else if (code === 47) last = 63;
		else return false;
	}
	// RFC 4648: unused low bits must be zero for a canonical final quantum.
	return padding === 0 || (last & (padding === 2 ? 15 : 3)) === 0;
};

// Must be invoked from a writable Next.js context. Never expose a generic user update API.
export const mutateOwnAvatar = async (input: AvatarOperation): Promise<AvatarMutationResult> => {
	if (!isObject(input)) return { status: 'validation-error' };
	const setting = input.operation === 'set';
	if (
		(!setting && input.operation !== 'delete') ||
		Object.keys(input).some(
			(key) => !['operation', ...(setting ? ['avatarImage'] : [])].includes(key),
		)
	)
		return { status: 'validation-error' };
	if (setting && !validAvatarBase64(input.avatarImage)) return { status: 'validation-error' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const { data } = session;
	try {
		const { apiOrigin, allowedOrigins } = getAuthBackendConfig();
		if (!allowedOrigins.includes(apiOrigin)) return { status: 'error' };
		const result = await avatarTimeout(async (signal): Promise<AvatarMutationResult> => {
			const response = await fetch(
				new URL(`/users/${encodeURIComponent(data.userId)}`, apiOrigin),
				{
					method: 'PATCH',
					cache: 'no-store',
					redirect: 'manual',
					credentials: 'omit',
					signal,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${data.accessToken}`,
					},
					body: JSON.stringify(setting ? { avatarImage: input.avatarImage } : { avatarUrl: '' }),
				},
			);
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) return { status: 'forbidden' };
			if (response.status !== 200) return { status: 'error' };
			const value: unknown = await response.json();
			if (!isObject(value) || typeof value.id !== 'string' || !validAvatarUrl(value.avatarUrl))
				return { status: 'error' };
			if (value.id !== data.userId) return { status: 'identity-mismatch' };
			if ((setting && !value.avatarUrl) || (!setting && value.avatarUrl))
				return { status: 'error' };
			return { status: 'success', avatarUrl: value.avatarUrl || null };
		});
		return result;
	} catch {
		return { status: 'error' };
	}
};

// Writable server context only. Identity and credentials never come from Action arguments.
export const mutateOwnProfile = async (input: unknown): Promise<ProfileEditResult> => {
	const data = parseProfileEditInput(input);
	if (!data) return { status: 'validation-error' };
	const session = await currentBackendSession();
	if (session.status !== 'success')
		return { status: session.status === 'error' ? 'error' : 'unauthorized' };
	try {
		const result = await saveOwnProfile(
			data,
			{
				userId: session.data.userId,
				accessToken: session.data.accessToken,
				expiresAt: Math.min(session.data.accessExpiresAt, deadline(session.data)),
			},
			getAuthBackendConfig(),
		);
		if (result.status !== 'success') return result;
		try {
			const signal = { user: {}, syncProfile: true };
			const updated = await nextAuth.unstable_update(signal);
			if (
				!isObject(updated?.user) ||
				updated.user.id !== session.data.userId ||
				updated.user.username !== data.username
			)
				return { status: 'sync-required' };
			return { status: 'success' };
		} catch {
			return { status: 'sync-required' };
		}
	} catch {
		return { status: 'error' };
	}
};
