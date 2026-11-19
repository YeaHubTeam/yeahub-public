import 'server-only';

import { readOwnProfile } from '@/entities/profile/index.server';
import type { FavoriteQuestionInput, FavoriteQuestionResult } from '@/entities/question';
import { mutateQuestionFavorite } from '@/entities/question/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';
import { getOwnQuestionPersonalState } from './reads.server';

export const setOwnQuestionFavorite = async (
	input: FavoriteQuestionInput,
): Promise<FavoriteQuestionResult> => {
	if (
		!input ||
		!Number.isSafeInteger(input.questionId) ||
		input.questionId <= 0 ||
		typeof input.favorite !== 'boolean' ||
		typeof input.expectedProfileId !== 'string'
	)
		return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readOwnProfile(credentials, config);
		if (before.status !== 'success') return before;
		const profileId = before.profile.activeProfile.id;
		if (profileId !== input.expectedProfileId) return { status: 'identity-mismatch' };
		if (!before.profile.isVerified) return { status: 'unverified' };
		if (
			!(await mutateQuestionFavorite(
				input.questionId,
				input.favorite,
				{ ...credentials, profileId },
				config,
			))
		)
			return { status: 'error' };
		const after = await getOwnQuestionPersonalState(input.questionId);
		if (after.status !== 'success') return after;
		if (after.userId !== credentials.userId || after.profileId !== profileId)
			return { status: 'identity-mismatch' };
		return after.state.isFavorite === input.favorite ? after : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
