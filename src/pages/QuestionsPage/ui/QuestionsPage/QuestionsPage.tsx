import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { Question } from '@/entities/question';
import { SPEC_MAP } from '@/shared/libs';
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
	questions: Question[];
	total: number;
	limit: number;
	specialization: keyof typeof SPEC_MAP;
	searchParamsTitle: string | undefined;
}

export const QuestionsPage = ({
	locale,
	page,
	questions,
	total,
	limit,
	specialization,
	searchParamsTitle,
}: QuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<FullQuestionsList questions={questions} specialization={specialization} />

				<QuestionPagePagination total={total} limit={limit} currentPage={page} />

				{questions.length === 0 && <EmptyStub text={searchParamsTitle} />}
			</Card>
			<Card className={styles.filters}>
				<QuestionsFilterPanel />
			</Card>
		</Flex>
	);
};
