import NextAuth from 'next-auth';
import { encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import 'server-only';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/index.server';
import { readOwnProfile } from '@/entities/profile/index.server';
import { AuthRefreshError, refreshAuthCredentials } from '@/lib/authRefresh.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import {
	deadline,
	emailField,
	getTokenExpiry,
	isBackendSession,
	isObject,
} from './backendSession.server';
import type { BackendSession } from './backendSession.server';
import { passwordReplacement, sessionFingerprint } from './passwordReplacement.server';

export const nextAuth = NextAuth(() => ({
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

			const replacement = passwordReplacement.getStore();
			if (trigger === 'update' && replacement) {
				if (
					replacement.applied ||
					replacement.userId !== stored.userId ||
					token.sub !== stored.userId ||
					replacement.fingerprint !== sessionFingerprint(stored) ||
					replacement.originalDeadline !== stored.sessionExpiresAt ||
					deadline(replacement.next) <= Math.floor(Date.now() / 1000)
				)
					return token;
				replacement.applied = true;
				return { sub: stored.userId, backendSession: replacement.next };
			}
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
