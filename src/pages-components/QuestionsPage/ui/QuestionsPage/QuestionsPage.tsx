import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListResponse } from '@/entities/questions';
import { SPEC_MAP } from '@/shared/constants';
import { Card } from '@/shared/ui/Card';
import { EmptyStub } from '@/shared/ui/EmptyStub';
import { Flex } from '@/shared/ui/Flex';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';
import { QuestionPagePagination } from '../QuestionsPagePagination/QuestionPagePagination';
import styles from './QuestionsPage.module.css';

interface QuestionsPageProps {
	locale: string;
	page: number;
	questionsResponse: GetQuestionsListResponse;
	specialization: keyof typeof SPEC_MAP;
	searchParamsTitle: string | undefined;
}

export const QuestionsPage = ({
	locale,
	page,
	questionsResponse,
	specialization,
	searchParamsTitle,
}: QuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<FullQuestionsList questions={questionsResponse.data} specialization={specialization} />

				{questionsResponse.total > questionsResponse.limit && (
					<QuestionPagePagination questionsResponse={questionsResponse} currentPage={page} />
				)}
				{questionsResponse.data.length === 0 && <EmptyStub text={searchParamsTitle} />}
			</Card>
			<Card className={styles.filters}>
				<QuestionsFilterPanel />
			</Card>
		</Flex>
	);
};
