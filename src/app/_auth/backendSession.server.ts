import 'server-only';

import { BackendAuthError } from '@/entities/auth/index.server';

export type BackendSession = {
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

export const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const isBackendSession = (value: unknown): value is BackendSession =>
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
export const emailField = (email: unknown): { email?: string | null } =>
	typeof email === 'string' || email === null ? { email } : {};

export const deadline = (session: BackendSession) =>
	Math.min(session.refreshExpiresAt, session.sessionExpiresAt);

// Expiry metadata from a trusted backend response is not signature/session verification.
export const getTokenExpiry = (token: string): number => {
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
