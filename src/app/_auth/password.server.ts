import { cookies } from 'next/headers';

import 'server-only';

import type { ChangePasswordResult } from '@/entities/auth';
import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline, getTokenExpiry, isBackendSession, isObject } from './backendSession.server';
import type { BackendSession } from './backendSession.server';
import { passwordReplacement, sessionFingerprint } from './passwordReplacement.server';
import type { PasswordReplacement } from './passwordReplacement.server';
import { nextAuth } from './runtime.server';
import { currentBackendSession } from './session.server';

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
