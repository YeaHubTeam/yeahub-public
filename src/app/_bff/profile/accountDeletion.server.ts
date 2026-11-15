import 'server-only';

import { deleteOwnAccount } from '@/entities/profile/index.server';
import type { AccountDeletionResult } from '@/entities/profile/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

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
