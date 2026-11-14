import 'server-only';

import type { ProfileBackendConfig } from './profile.server';
import { readSettingsSnapshot } from './settings.server';

export type AccountDeletionResult = {
	status:
		| 'success'
		| 'unauthenticated'
		| 'refresh-required'
		| 'invalid-input'
		| 'confirmation-mismatch'
		| 'forbidden'
		| 'outcome-unknown'
		| 'error';
};
export const deleteOwnAccount = async (
	confirmationUsername: unknown,
	credentials: {
		userId: string;
		accessToken: string;
		accessExpiresAt: number;
		sessionDeadline: number;
	},
	config: ProfileBackendConfig,
): Promise<AccountDeletionResult> => {
	if (typeof confirmationUsername !== 'string' || !confirmationUsername)
		return { status: 'invalid-input' };
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(credentials.userId))
		return { status: 'error' };
	const validity = () => {
		const now = Math.floor(Date.now() / 1000);
		if (credentials.sessionDeadline <= now) return 'unauthenticated';
		if (credentials.accessExpiresAt <= now) return 'refresh-required';
		return null;
	};
	const expired = validity();
	if (expired) return { status: expired };
	const before = await readSettingsSnapshot(credentials, config);
	if (before.status !== 'success')
		return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
	if (before.snapshot.userId !== credentials.userId) return { status: 'error' };
	if (!before.snapshot.username || before.snapshot.username !== confirmationUsername)
		return { status: 'confirmation-mismatch' };
	const expiredAfterRead = validity();
	if (expiredAfterRead) return { status: expiredAfterRead };
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const request = async (): Promise<AccountDeletionResult> => {
			const response = await fetch(new URL(`/users/${credentials.userId}`, config.apiOrigin), {
				method: 'DELETE',
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
				headers: { Authorization: `Bearer ${credentials.accessToken}` },
			});
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) return { status: 'forbidden' };
			const value: unknown = await response.json();
			const message =
				typeof value === 'object' && value !== null && !Array.isArray(value) && 'message' in value
					? value.message
					: undefined;
			if (response.status === 200 && message === 'User deleted successfully')
				return { status: 'success' };
			// Storage failures may happen after the database deletion, including HTTP 400/404.
			// Recognize only specific pre-mutation refusals; never infer rollback from an HTTP error.
			if (response.status === 400 && message === 'Validation failed (uuid is expected)')
				return { status: 'invalid-input' };
			if (response.status === 400 && message === 'user.user.already_deleted')
				return { status: 'error' };
			return { status: 'outcome-unknown' };
		};
		const timeout = new Promise<AccountDeletionResult>((resolve) => {
			timer = setTimeout(() => {
				controller.abort();
				resolve({ status: 'outcome-unknown' });
			}, 5000);
		});
		return await Promise.race([request(), timeout]);
	} catch {
		return { status: 'outcome-unknown' };
	} finally {
		clearTimeout(timer);
	}
};
