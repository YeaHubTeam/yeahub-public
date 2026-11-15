import { cookies, headers } from 'next/headers';

import { createActionURL, setEnvDefaults } from '@auth/core';
import type { AuthConfig } from '@auth/core';
import { differenceInDays, format, getDaysInMonth, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import NextAuth from 'next-auth';
import { encode, getToken } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';
import 'server-only';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';
import { readPaymentHistory } from '@/entities/payment/index.server';
import type { PaymentHistoryResult } from '@/entities/payment/index.server';
import {
	createOwnProfile,
	deleteOwnAccount,
	deleteOwnProfile,
	mutateTelegram,
	parseProfileEditInput,
	parseTelegramPayload,
	readHeaderProfile,
	readOwnProfile,
	readSettingsSnapshot,
	saveOwnProfile,
	selectOwnProfile,
	sendVerificationEmail,
} from '@/entities/profile/server';
import type {
	AccountDeletionResult,
	HeaderProfileResult,
	ProfileCreationResult,
	ProfileDeletionResult,
	ProfileEditResult,
	ProfileSelectionResult,
	SettingsSnapshotResult,
	TelegramMutationResult,
	VerificationEmailResult,
} from '@/entities/profile/server';
import {
	isCancellationSubscriptionId,
	parsePaymentInitInput,
	readSettingsCatalog,
	requestPaymentInit,
	requestSubscriptionCancellation,
	requestTrial,
} from '@/entities/subscription/index.server';
import type {
	PaymentInitInput,
	PaymentInitResult,
	SettingsTariffCatalogResult,
	SubscriptionCancellationResult,
	TrialResult,
} from '@/entities/subscription/index.server';
import { backendHttp } from '@/shared/api/index.server';
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';
import { readTariffFlag } from '@/shared/config/index.server';

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

type PasswordReplacement = {
	userId: string;
	fingerprint: string;
	originalDeadline: number;
	next: BackendSession;
	applied: boolean;
};
const passwordReplacement = new AsyncLocalStorage<PasswordReplacement>();
const sessionFingerprint = (data: BackendSession) =>
	createHash('sha256')
		.update(
			JSON.stringify([
				data.userId,
				data.accessToken,
				data.refreshToken,
				data.accessExpiresAt,
				data.refreshExpiresAt,
				data.sessionExpiresAt,
			]),
		)
		.digest('hex');

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

// Shared, private cookie verification for server reads and mutations.
const currentBackendSession = async (writtenCookie?: string) => {
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
			req: {
				headers: new Headers({ cookie: writtenCookie ?? requestHeaders.get('cookie') ?? '' }),
			},
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

// Explicit page-only composition. Ordinary snapshot reads and mutations never load flags/catalog.
export const getSettingsPageData = async (): Promise<
	| {
			status: 'success';
			snapshot: Extract<SettingsSnapshotResult, { status: 'success' }>['snapshot'];
			tariffs: SettingsTariffCatalogResult;
	  }
	| Exclude<SettingsSnapshotResult, { status: 'success' }>
> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		const config = getAuthBackendConfig();
		const flag = await readTariffFlag(config);
		const result = await readSettingsSnapshot(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			config,
			flag,
		);
		if (result.status !== 'success') return result;
		const tariffs = await readSettingsCatalog(
			result.tariffGate ?? { status: 'unavailable', showTariffs: false },
			config,
		);
		return { status: 'success', snapshot: result.snapshot, tariffs };
	} catch {
		return { status: 'error' };
	}
};

// Read-only pagination: no profile request, auth update or client-supplied identity.
export const getSettingsPaymentHistory = async (
	page: unknown = 1,
): Promise<PaymentHistoryResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readPaymentHistory(
			page,
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

// Explicit trial mutation with fresh eligibility and one post-success readback.
export const startOwnSettingsTrial = async (): Promise<TrialResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	let sent = false;
	let confirmed = false;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readSettingsSnapshot(credentials, config);
		if (before.status !== 'success')
			return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
		if (before.snapshot.userId !== session.data.userId) return { status: 'error' };
		if (!before.snapshot.isVerified) return { status: 'verification-required' };
		if (!before.snapshot.canStartTrial) return { status: 'not-eligible' };
		const now = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= now) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= now) return { status: 'refresh-required' };
		sent = true;
		const result = await requestTrial(credentials, config);
		if (result.status !== 'success') return result;
		confirmed = true;
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success' || after.snapshot.userId !== session.data.userId)
			return { status: 'incomplete' };
		const trials = after.snapshot.subscriptions.filter((item) => item.subscriptionId === 4);
		const trial = trials[0];
		if (
			trials.length !== 1 ||
			!trial ||
			trial.state !== 'active' ||
			!trial.endDate ||
			Date.parse(trial.endDate) <= Date.now()
		)
			return { status: 'incomplete' };
		return { status: 'success' };
	} catch {
		return { status: confirmed ? 'incomplete' : sent ? 'outcome-unknown' : 'error' };
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

export const deleteOwnSettingsAccount = async (
	confirmationUsername: unknown,
): Promise<AccountDeletionResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await deleteOwnAccount(
			confirmationUsername,
			{
				userId: session.data.userId,
				accessToken: session.data.accessToken,
				accessExpiresAt: session.data.accessExpiresAt,
				sessionDeadline: deadline(session.data),
			},
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const deleteOwnSettingsProfile = async (
	profileId: string,
	confirmationUsername: string,
): Promise<ProfileDeletionResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await deleteOwnProfile(
			profileId,
			confirmationUsername,
			{
				userId: session.data.userId,
				accessToken: session.data.accessToken,
				accessExpiresAt: session.data.accessExpiresAt,
				sessionDeadline: deadline(session.data),
			},
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const createOwnSettingsProfile = async (): Promise<ProfileCreationResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await createOwnProfile(
			{
				userId: session.data.userId,
				accessToken: session.data.accessToken,
				accessExpiresAt: session.data.accessExpiresAt,
				sessionDeadline: deadline(session.data),
			},
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const selectOwnSettingsProfile = async (
	profileId: unknown,
): Promise<ProfileSelectionResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await selectOwnProfile(
			profileId,
			{
				userId: session.data.userId,
				accessToken: session.data.accessToken,
				accessExpiresAt: session.data.accessExpiresAt,
				sessionDeadline: deadline(session.data),
			},
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export type ChangePasswordResult =
	| { status: 'success' }
	| {
			status:
				| 'validation-error'
				| 'unauthenticated'
				| 'refresh-required'
				| 'forbidden'
				| 'not-found'
				| 'error';
	  }
	| {
			status: 'incomplete';
			stage: 'backend-result-unverified' | 'session-update-failed' | 'deadline-expired';
	  }
	| { status: 'outcome-unknown' };

export const changeOwnPassword = async (input: unknown): Promise<ChangePasswordResult> => {
	if (
		!isObject(input) ||
		Object.keys(input).some((key) => !['password', 'passwordConfirm'].includes(key)) ||
		!['password', 'passwordConfirm'].every((key) => Object.hasOwn(input, key)) ||
		typeof input.password !== 'string' ||
		typeof input.passwordConfirm !== 'string' ||
		input.password.length < 8 ||
		input.password.length > 255 ||
		input.passwordConfirm.length < 8 ||
		input.passwordConfirm.length > 255 ||
		input.password !== input.passwordConfirm
	)
		return { status: 'validation-error' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const original = session.data;
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	let result: Awaited<ReturnType<ReturnType<typeof createBackendAuthTransport>['changePassword']>>;
	try {
		const transport = createBackendAuthTransport({
			...getAuthBackendConfig(),
			fetch: (url, init) => fetch(url, { ...init, signal: controller.signal }),
		});
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(() => {
				controller.abort();
				reject(new Error('Password change outcome unknown'));
			}, 5000);
		});
		result = await Promise.race([
			transport.changePassword({
				userId: original.userId,
				accessToken: original.accessToken,
				password: input.password,
				passwordConfirm: input.passwordConfirm,
			}),
			timeout,
		]);
	} catch (error) {
		if (error instanceof BackendAuthError) {
			if (error.kind === 'http' && error.status !== undefined && error.status >= 500)
				return { status: 'outcome-unknown' };
			if (error.kind === 'http')
				return {
					status:
						error.status === 400
							? 'validation-error'
							: error.status === 401
								? 'unauthenticated'
								: error.status === 403
									? 'forbidden'
									: error.status === 404
										? 'not-found'
										: 'error',
				};
			if (error.kind === 'configuration') return { status: 'error' };
			if (error.kind === 'protocol')
				return { status: 'incomplete', stage: 'backend-result-unverified' };
		}
		return { status: 'outcome-unknown' };
	} finally {
		clearTimeout(timer);
	}
	let replacement: PasswordReplacement;
	try {
		if (result.user.id !== original.userId) throw new Error('Identity mismatch');
		const accessExpiresAt = getTokenExpiry(result.access_token);
		const refreshExpiresAt = getTokenExpiry(result.refreshToken);
		for (const value of [result.access_token, result.refreshToken]) {
			const claims: unknown = JSON.parse(
				Buffer.from(value.split('.')[1], 'base64url').toString('utf8'),
			);
			if (!isObject(claims) || claims.sub !== original.userId) throw new Error('Identity mismatch');
		}
		const next: BackendSession = {
			...original,
			accessToken: result.access_token,
			refreshToken: result.refreshToken,
			accessExpiresAt,
			refreshExpiresAt,
		};
		delete next.refreshRetryRequired;
		if (!isBackendSession(next)) throw new Error('Invalid credentials');
		replacement = {
			userId: original.userId,
			fingerprint: sessionFingerprint(original),
			originalDeadline: original.sessionExpiresAt,
			next,
			applied: false,
		};
	} catch {
		return { status: 'incomplete', stage: 'backend-result-unverified' };
	}
	if (deadline(original) <= Math.floor(Date.now() / 1000))
		return { status: 'incomplete', stage: 'deadline-expired' };
	try {
		const updated = await passwordReplacement.run(replacement, () => nextAuth.unstable_update({}));
		if (!replacement.applied || updated?.user?.id !== original.userId)
			return { status: 'incomplete', stage: 'session-update-failed' };
		const jar = await cookies();
		const written = jar
			.getAll()
			.map(({ name, value }) => `${name}=${value}`)
			.join('; ');
		const verified = await currentBackendSession(written);
		if (
			verified.status !== 'success' ||
			sessionFingerprint(verified.data) !== sessionFingerprint(replacement.next)
		) {
			return {
				status: 'incomplete',
				stage:
					deadline(original) <= Math.floor(Date.now() / 1000)
						? 'deadline-expired'
						: 'session-update-failed',
			};
		}
		return { status: 'success' };
	} catch {
		return {
			status: 'incomplete',
			stage:
				deadline(original) <= Math.floor(Date.now() / 1000)
					? 'deadline-expired'
					: 'session-update-failed',
		};
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
		const config = getAuthBackendConfig();
		const result = await backendHttp<AvatarMutationResult>({
			config,
			path: `/users/${encodeURIComponent(data.userId)}`,
			method: 'PATCH',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${data.accessToken}`,
			},
			body: JSON.stringify(setting ? { avatarImage: input.avatarImage } : { avatarUrl: '' }),
			decode: async (response) => {
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
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
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

// Explicit payment initialization only. No session writes or mutation replay.
export const initializeOwnSettingsPayment = async (
	input: PaymentInitInput,
): Promise<PaymentInitResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const parsed = parsePaymentInitInput(input);
	if (!parsed) return { status: 'invalid-input' };
	let sent = false;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const flag = await readTariffFlag(config);
		const before = await readSettingsSnapshot(credentials, config, flag);
		if (before.status !== 'success')
			return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
		if (before.snapshot.userId !== session.data.userId) return { status: 'error' };
		if (!before.snapshot.isVerified) return { status: 'verification-required' };
		const catalog = await readSettingsCatalog(
			before.tariffGate ?? { status: 'unavailable', showTariffs: false },
			config,
		);
		if (catalog.status === 'hidden') return { status: 'not-available' };
		if (catalog.status !== 'success') return { status: 'error' };
		if (
			!catalog.tariffs.some(
				(tariff) =>
					tariff.id === parsed.tariffId && ['month', 'quarter', 'year'].includes(tariff.code),
			)
		)
			return { status: 'not-available' };
		const payment = parsePaymentInitInput({
			...parsed,
			email: before.snapshot.email ?? parsed.email,
		});
		if (!payment) return { status: 'invalid-input' };
		const now = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= now) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= now) return { status: 'refresh-required' };
		sent = true;
		return await requestPaymentInit(payment, credentials, config);
	} catch {
		return { status: sent ? 'outcome-unknown' : 'error' };
	}
};

// No replay: state readback cannot prove primary/rebill cleanup after a failed DELETE.
export const cancelOwnSettingsSubscription = async (
	expectedSubscriptionId: string,
): Promise<SubscriptionCancellationResult> => {
	if (!isCancellationSubscriptionId(expectedSubscriptionId)) return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	let sent = false;
	let confirmed = false;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readSettingsSnapshot(credentials, config);
		if (before.status !== 'success')
			return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
		if (before.snapshot.userId !== session.data.userId) return { status: 'error' };
		if (!before.snapshot.isVerified) return { status: 'verification-required' };
		const now = Date.now();
		const selected = before.snapshot.subscriptions.find(
			(item) =>
				(item.state === 'active' || item.state === 'canceled') &&
				item.endDate !== null &&
				Number.isFinite(Date.parse(item.endDate)) &&
				Date.parse(item.endDate) >= now,
		);
		if (!selected || selected.state !== 'active') return { status: 'not-available' };
		if (selected.id !== expectedSubscriptionId) return { status: 'conflict' };
		const seconds = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= seconds) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= seconds) return { status: 'refresh-required' };
		sent = true;
		const result = await requestSubscriptionCancellation(
			selected.subscriptionId,
			credentials,
			config,
		);
		if (result.status !== 'success') return result;
		confirmed = true;
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success' || after.snapshot.userId !== session.data.userId)
			return { status: 'incomplete' };
		const canceled = after.snapshot.subscriptions.find((item) => item.id === selected.id);
		if (
			!canceled ||
			canceled.subscriptionId !== selected.subscriptionId ||
			canceled.state !== 'canceled' ||
			canceled.endDate !== selected.endDate ||
			!canceled.endDate
		)
			return { status: 'incomplete' };
		const createDate = parseISO(canceled.createDate);
		const endDate = parseISO(canceled.endDate);
		if (!isValid(createDate) || !isValid(endDate)) return { status: 'incomplete' };
		return {
			status: 'success',
			subscription: {
				state: 'canceled',
				daysLeft: Math.max(0, differenceInDays(endDate, new Date())),
				daysInCreationMonth: getDaysInMonth(createDate),
				endDateLabel: format(endDate, 'd MMMM yyyy', { locale: ru }),
			},
		};
	} catch {
		return { status: confirmed ? 'incomplete' : sent ? 'outcome-unknown' : 'error' };
	}
};
