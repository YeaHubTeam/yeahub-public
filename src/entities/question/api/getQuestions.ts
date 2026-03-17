import { apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { questionApiUrls } from '../model/constants/question';
import type {
	GetQuestionSlugsResponse,
	GetQuestionsListParamsRequest,
	GetQuestionsListResponse,
	GetQuestionsSlugsParamsRequest,
	Question,
} from '../model/types/question';
import { GetQuestionsBySpecializationCountResponse } from '../model/types/question';

export async function getQuestionsList(params: GetQuestionsListParamsRequest) {
	return apiFetch<GetQuestionsListResponse>(questionApiUrls.getQuestionsList, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
			skillFilterMode: params.skillFilterMode ?? 'ANY',
		},
	});
}

export async function getQuestionById(id: number) {
	return apiFetch<Question>(route(questionApiUrls.getQuestionById, id || ''));
}

export async function getCollectionQuestions(id: number, limit: number) {
	return apiFetch<GetQuestionsListResponse>(
		`${questionApiUrls.getQuestionsList}?skillFilterMode=ANY&collection=${id}&limit=${limit}`,
	);
}

export async function getQuestionSlugs(params?: GetQuestionsSlugsParamsRequest) {
	return apiFetch<GetQuestionSlugsResponse>(questionApiUrls.getSlugs, {
		searchParams: {
			page: params?.page ?? 1,
			limit: params?.limit ?? 100,
			specializationSlug: params?.specializationSlug,
		},
	});
}

export async function getQuestionBySlug(slug: string) {
	return apiFetch<Question>(route(questionApiUrls.getQuestionBySlug, slug));
}

export async function getQuestionsSpecializationByIdCount(specializationId: number) {
	return apiFetch<GetQuestionsBySpecializationCountResponse>(
		route(questionApiUrls.getStatisticsQuestionsSpecializationById, specializationId),
	);
}
