import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { QuestionPersonalState } from '../model/types/personalState';

export type PersonalQuestionRead =
	| { status: 'success'; state: QuestionPersonalState }
	| { status: 'unauthenticated' | 'forbidden' | 'not-found' | 'error' };

export const readQuestionPersonalState = async (
	questionId: number,
	credentials: { profileId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<PersonalQuestionRead> => {
	if (
		!Number.isSafeInteger(questionId) ||
		questionId <= 0 ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			credentials.profileId,
		) ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
	)
		return { status: 'error' };
	const result = await backendHttp<PersonalQuestionRead>({
		config,
		path: `/questions/${questionId}?profileId=${encodeURIComponent(credentials.profileId)}`,
		method: 'GET',
		effect: 'read',
		cache: 'no-store',
		timeoutMs: 5000,
		headers: { Authorization: `Bearer ${credentials.accessToken}` },
		decode: async (response) => {
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) return { status: 'forbidden' };
			if (response.status === 404) return { status: 'not-found' };
			if (response.status !== 200) return { status: 'error' };
			const dto: unknown = await response.json();
			if (
				!dto ||
				typeof dto !== 'object' ||
				Array.isArray(dto) ||
				!('id' in dto) ||
				dto.id !== questionId ||
				!('checksCount' in dto) ||
				!Number.isSafeInteger(dto.checksCount) ||
				(dto.checksCount as number) < 0 ||
				!('isLearned' in dto) ||
				typeof dto.isLearned !== 'boolean' ||
				!('isFavorite' in dto) ||
				typeof dto.isFavorite !== 'boolean'
			)
				return { status: 'error' };
			return {
				status: 'success',
				state: {
					questionId,
					checksCount: dto.checksCount as number,
					isLearned: dto.isLearned,
					isFavorite: dto.isFavorite,
				},
			};
		},
	});
	return result.status === 'response' ? result.value : { status: 'error' };
};
