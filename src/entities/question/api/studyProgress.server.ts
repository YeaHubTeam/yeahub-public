import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { QuestionStudyOperation } from '../model/types/studyProgress';

export const mutateQuestionStudyProgress = async (
	questionId: number,
	operation: QuestionStudyOperation,
	credentials: { profileId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<boolean> => {
	const result = await backendHttp({
		config,
		path: operation === 'learn'
			? '/interview-preparation'
			: `/interview-preparation/learn/${encodeURIComponent(credentials.profileId)}/reset/${questionId}`,
		method: 'PUT',
		effect: 'mutation',
		cache: 'no-store',
		timeoutMs: 5000,
		headers: {
			Authorization: `Bearer ${credentials.accessToken}`,
			...(operation === 'learn' ? { 'Content-Type': 'application/json' } : {}),
		},
		...(operation === 'learn' ? {
			body: JSON.stringify({ profileId: credentials.profileId, questionId, isLearned: true }),
		} : {}),
		decode: response => Promise.resolve(response.status === 200),
	});
	return result.status === 'response' && result.value;
};
