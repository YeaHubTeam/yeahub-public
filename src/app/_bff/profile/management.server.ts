import 'server-only';

import {
	createOwnProfile,
	deleteOwnProfile,
	selectOwnProfile,
} from '@/entities/profile/index.server';
import type {
	ProfileCreationResult,
	ProfileDeletionResult,
	ProfileSelectionResult,
} from '@/entities/profile/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

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
