import { apiFetch } from '@/shared/api';

import type {
	GetQuestionsListParamsRequest,
	GetQuestionsListResponse,
	Question,
} from '../model/types/question';

const QUESTIONS_BASE = 'questions/public-questions';

export async function getQuestionsList(params: GetQuestionsListParamsRequest) {
	return apiFetch<GetQuestionsListResponse>(QUESTIONS_BASE, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
			skillFilterMode: params.skillFilterMode ?? 'ANY',
		},
	});
}

export async function getQuestionById(id: number) {
	return apiFetch<Question>(`${QUESTIONS_BASE}/${id}`);
}
