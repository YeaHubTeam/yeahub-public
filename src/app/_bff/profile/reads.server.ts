import 'server-only';

import { readHeaderProfile, readOwnProfile } from '@/entities/profile/index.server';
import type { HeaderProfileResult } from '@/entities/profile/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

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
