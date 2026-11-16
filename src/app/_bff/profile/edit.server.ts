import 'server-only';

import { parseProfileEditInput, saveOwnProfile } from '@/entities/profile/index.server';
import type { ProfileEditResult } from '@/entities/profile/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline, isObject } from '../../_auth/backendSession.server';
import { nextAuth } from '../../_auth/runtime.server';
import { currentBackendSession } from '../../_auth/session.server';

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
