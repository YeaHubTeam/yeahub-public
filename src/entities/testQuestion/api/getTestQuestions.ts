import { apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { testQuestionApiUrls } from '../model/constants/testQuestion';
import type {
	GetTestQuestionsListParams,
	GetTestQuestionsListResponse,
	TestQuestion,
} from '../model/types/testQuestion';

export async function getPublicTestQuestionsList(params: GetTestQuestionsListParams = {}) {
	return apiFetch<GetTestQuestionsListResponse>(testQuestionApiUrls.getPublicQuestions, {
		searchParams: {
			page: params.page ?? 1,
			limit: params.limit ?? 50,
			orderBy: 'createdAt',
			order: 'ASC',
		},
	});
}

export async function getPublicTestQuestionById(id: string): Promise<TestQuestion | null> {
	if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
		return null;
	}

	try {
		const question = await apiFetch<TestQuestion>(
			route(testQuestionApiUrls.getPublicQuestionById, id),
		);

		return question.status === 'public' ? question : null;
	} catch (error) {
		const cause: unknown = error instanceof Error ? error.cause : undefined;
		if (typeof cause === 'object' && cause !== null && 'status' in cause && cause.status === 404) {
			return null;
		}

		throw error;
	}
}

export async function getAllPublicTestQuestions(): Promise<TestQuestion[]> {
	const firstPage = await getPublicTestQuestionsList();
	if (!Number.isInteger(firstPage.limit) || firstPage.limit < 1) {
		throw new Error('Invalid test questions pagination limit');
	}

	const questions = new Map(firstPage.data.map((question) => [question.id, question]));
	const totalPages = Math.ceil(firstPage.total / firstPage.limit);

	for (let page = 2; page <= totalPages; page++) {
		const response = await getPublicTestQuestionsList({ page, limit: firstPage.limit });
		response.data.forEach((question) => questions.set(question.id, question));
	}

	return [...questions.values()].filter((question) => question.status === 'public');
}
