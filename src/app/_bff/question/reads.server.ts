import 'server-only';

import { readOwnProfile, readSettingsSnapshot } from '@/entities/profile/index.server';
import type { QuestionPersonalStateResult } from '@/entities/question';
import { readQuestionPersonalState } from '@/entities/question/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

// No client userId/profileId. The question endpoint itself does not check profile ownership.
export const getOwnQuestionPersonalState = async (
	questionId: number,
): Promise<QuestionPersonalStateResult> => {
	if (!Number.isSafeInteger(questionId) || questionId <= 0) return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readOwnProfile(credentials, config);
		if (before.status !== 'success') return before;
		const profileId = before.profile.activeProfile.id;
		const result = await readQuestionPersonalState(
			questionId,
			{ ...credentials, profileId },
			config,
		);
		if (result.status !== 'success') return result;
		// A profile switch during the question read must never publish the old profile's state.
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success') return after;
		if (!after.snapshot.activeProfileId) return { status: 'no-active-profile' };
		if (after.snapshot.activeProfileId !== profileId) return { status: 'identity-mismatch' };
		return {
			status: 'success',
			userId: credentials.userId,
			profileId,
			isVerified: after.snapshot.isVerified,
			hasPremiumAccess: after.snapshot.hasPremiumAccess,
			state: result.state,
		};
	} catch {
		return { status: 'error' };
	}
};
