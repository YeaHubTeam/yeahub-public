import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListResponse } from '@/entities/question';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { QuestionPagePagination } from '../QuestionsPagePagination/QuestionPagePagination';

interface QuestionsPageProps {
	locale: string;
	page: number;
	questionsResponse: GetQuestionsListResponse;
}

export const QuestionsPage = ({ locale, page, questionsResponse }: QuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card>
				<FullQuestionsList questions={questionsResponse.data} />
				<QuestionPagePagination questionsResponse={questionsResponse} currentPage={page} />
			</Card>
		</Flex>
	);
};
