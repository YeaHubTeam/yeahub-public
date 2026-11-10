import { createHash } from 'node:crypto';
import 'server-only';

import { BackendAuthError, createBackendAuthTransport } from '@/entities/auth/server';
import { getAuthBackendConfig } from '@/shared/config/authBackend.server';

type RefreshTransport = Pick<ReturnType<typeof createBackendAuthTransport>, 'refresh'>;
type RefreshResult = Awaited<ReturnType<RefreshTransport['refresh']>>;
type RefreshFailure =
	| 'unauthorized'
	| 'network'
	| 'protocol'
	| 'configuration'
	| 'identity'
	| 'capacity'
	| 'backend';

export class AuthRefreshError extends Error {
	constructor(public readonly code: RefreshFailure) {
		super(`Auth refresh failed: ${code}`);
		this.name = 'AuthRefreshError';
	}
}

type Credentials = { refreshToken: string; expectedUserId: string };

// Process-local coordination only; it cannot order browser Set-Cookie responses.
export const createAuthRefreshCoordinator = (
	transport: RefreshTransport,
	{ ttlMs = 30_000, maxEntries = 128 }: { ttlMs?: number; maxEntries?: number } = {},
) => {
	if (
		!Number.isSafeInteger(ttlMs) ||
		ttlMs <= 0 ||
		!Number.isSafeInteger(maxEntries) ||
		maxEntries <= 0
	)
		throw new AuthRefreshError('configuration');
	const entries = new Map<
		string,
		{ promise: Promise<RefreshResult>; expiresAt?: number; timer?: ReturnType<typeof setTimeout> }
	>();

	return async ({ refreshToken, expectedUserId }: Credentials): Promise<RefreshResult> => {
		if (!refreshToken || !expectedUserId.trim()) throw new AuthRefreshError('configuration');
		const key = createHash('sha256').update(refreshToken).digest('hex');
		for (const [storedKey, entry] of entries) {
			if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
				clearTimeout(entry.timer);
				entries.delete(storedKey);
			}
		}
		let entry = entries.get(key);
		if (!entry) {
			if (entries.size >= maxEntries) {
				const completed = [...entries].find(([, value]) => value.expiresAt !== undefined);
				if (completed) {
					clearTimeout(completed[1].timer);
					entries.delete(completed[0]);
				} else throw new AuthRefreshError('capacity');
			}
			// Defer transport invocation until after the pending entry is installed.
			const promise = Promise.resolve().then(async () => {
				try {
					const result = await transport.refresh(refreshToken);
					if (result.user.id !== expectedUserId) throw new AuthRefreshError('identity');
					const current = entries.get(key);
					if (current) {
						current.expiresAt = Date.now() + ttlMs;
						current.timer = setTimeout(() => {
							if (entries.get(key) === current) entries.delete(key);
						}, ttlMs);
						current.timer.unref?.();
					}
					return Object.freeze({ ...result, user: Object.freeze({ ...result.user }) });
				} catch (error) {
					entries.delete(key);
					if (error instanceof AuthRefreshError) throw error;
					if (error instanceof BackendAuthError) {
						if (error.kind === 'http')
							throw new AuthRefreshError(error.status === 401 ? 'unauthorized' : 'backend');
						throw new AuthRefreshError(error.kind);
					}
					throw new AuthRefreshError('backend');
				}
			});
			entry = { promise };
			entries.set(key, entry);
		}
		const result = await entry.promise;
		// Also check callers sharing another caller's in-flight/cached result.
		if (result.user.id !== expectedUserId) throw new AuthRefreshError('identity');
		return result;
	};
};

export const refreshAuthCredentials = createAuthRefreshCoordinator({
	refresh: (refreshToken) =>
		createBackendAuthTransport(getAuthBackendConfig()).refresh(refreshToken),
});
