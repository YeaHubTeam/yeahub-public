import 'server-only';

import type { QuestionStudyInput, QuestionStudyResult } from '@/entities/question';
import { mutateQuestionStudyProgress } from '@/entities/question/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';
import { getOwnQuestionPersonalState } from './reads.server';

export const changeOwnQuestionStudyProgress = async (
	input: QuestionStudyInput,
): Promise<QuestionStudyResult> => {
	if (!input || !Number.isSafeInteger(input.questionId) || input.questionId <= 0 ||
		typeof input.expectedProfileId !== 'string' ||
		(input.operation !== 'learn' && input.operation !== 'reset')) return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		const before = await getOwnQuestionPersonalState(input.questionId);
		if (before.status !== 'success') return before;
		if (before.userId !== session.data.userId || before.profileId !== input.expectedProfileId)
			return { status: 'identity-mismatch' };
		if (!before.isVerified) return { status: 'unverified' };
		if (!before.hasPremiumAccess) return { status: 'premium-required' };
		if (input.operation === 'learn' ? before.state.checksCount >= 3 : before.state.checksCount === 0)
			return { status: 'progress-unavailable' };
		// Recheck the cookie boundary after precheck; no stale credentials may authorize the write.
		const fresh = await currentBackendSession();
		if (fresh.status !== 'success') return fresh;
		if (fresh.data.userId !== before.userId) return { status: 'identity-mismatch' };
		const sent = await mutateQuestionStudyProgress(input.questionId, input.operation, {
			profileId: before.profileId, accessToken: fresh.data.accessToken,
		}, getAuthBackendConfig());
		if (!sent) return { status: 'error' };
		const after = await getOwnQuestionPersonalState(input.questionId);
		if (after.status !== 'success') return after;
		if (after.userId !== before.userId || after.profileId !== before.profileId)
			return { status: 'identity-mismatch' };
		const confirmed = input.operation === 'learn'
			? after.state.checksCount === 3 && after.state.isLearned
			: after.state.checksCount === 0 && !after.state.isLearned;
		return confirmed ? after : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
