import { apiFetch } from '@/shared/api';

import { createQuizApiUrls } from '../model/constants/quiz';
import type {
	CreateNewMockQuizParamsRequest,
	CreateNewMockQuizResponse,
} from '../model/types/quiz';

export async function createNewMockQuiz(params: CreateNewMockQuizParamsRequest) {
	return apiFetch<CreateNewMockQuizResponse>(createQuizApiUrls.createNewMockQuiz, {
		searchParams: {
			...params,
			limit: params.limit ?? 1,
		},
	});
}
