import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';
import 'server-only';

import type { BackendSession } from './backendSession.server';

export type PasswordReplacement = {
	userId: string;
	fingerprint: string;
	originalDeadline: number;
	next: BackendSession;
	applied: boolean;
};
export const passwordReplacement = new AsyncLocalStorage<PasswordReplacement>();
export const sessionFingerprint = (data: BackendSession) =>
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
