import { apiFetch } from '@/shared/api';

import { testQuestionApiUrls } from '../model/constants/testQuestion';
import {
	GetTestQuestionsListParamsRequest,
	GetTestQuestionsListResponse,
} from '../model/types/testQuestion';

export async function getTestQuestionsList(params: GetTestQuestionsListParamsRequest) {
	return apiFetch<GetTestQuestionsListResponse>(testQuestionApiUrls.getTestQuestionsList, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
			skillFilterMode: params.skillFilterMode ?? 'ANY',
		},
	});
}

export async function getTestQuestionsPublicList(params: GetTestQuestionsListParamsRequest) {
	return apiFetch<GetTestQuestionsListResponse>(testQuestionApiUrls.getTestQuestionsPublicList, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
			skillFilterMode: params.skillFilterMode ?? 'ANY',
		},
	});
}
