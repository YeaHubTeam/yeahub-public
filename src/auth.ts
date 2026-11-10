import NextAuth from 'next-auth';
import { encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import 'server-only';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';
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

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
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
		async jwt({ token, user, trigger }) {
			const stored = user && 'backendSession' in user ? user.backendSession : token.backendSession;
			if (!isBackendSession(stored) || deadline(stored) <= Math.floor(Date.now() / 1000))
				return null;
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
