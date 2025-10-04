import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { DEFAULT_SPECIALIZATION_NUMBER } from '@/shared/constants/queryConstants';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { PublicQuestionPagePagination } from '../PublicQuestionsPagePagination/PublicQuestionPagePagination';

interface QuestionsPageProps {
	locale: string;
	page: number;
}

export const PublicQuestionsPage = async ({ locale, page }: QuestionsPageProps) => {
	setRequestLocale(locale);
	const limit = 10;

	// TODO: После подключения фильтрации нужно сетать все квери-параметры в строку браузера
	const response = await fetch(
		`https://api.yeahub.ru/questions/public-questions?page=${page || 1}&limit=${limit}&skillFilterMode=ANY&specialization=${DEFAULT_SPECIALIZATION_NUMBER}`,
		{ cache: 'no-store' },
	);

	if (!response.ok) throw new Error('Failed to load questions');

	const questionsResponse = await response.json();

	return (
		<Flex gap="20" align="start">
			<Card>
				<FullQuestionsList questions={questionsResponse.data} isPublic />
				<PublicQuestionPagePagination questionsResponse={questionsResponse} currentPage={page} />
			</Card>
		</Flex>
	);
};
