import React from 'react';

import { useTranslations } from 'next-intl';

import { TestQuestion } from '@/entities/testQuestion';
import { TestQuestions, i18Namespace } from '@/shared/config';
import { Accordion } from '@/shared/ui/Accordion';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { FullTestQuestionItem } from '../FullTestQuestionItem/FullTestQuestionItem';

interface FullTestQuestionsListProps {
	questions: TestQuestion[];
	specialization: string;
	hasFilters?: boolean;
	locale: string;
}

export const FullTestQuestionsList = ({
	questions,
	specialization,
	hasFilters,
	locale,
}: FullTestQuestionsListProps) => {
	const t = useTranslations(i18Namespace.testQuestions);

	if (questions.length === 0 && !hasFilters) {
		return (
			<Stub
				type="empty"
				title={t(TestQuestions.STUB_EMPTY_TITLE)}
				subtitle={t(TestQuestions.STUB_EMPTY_SUBTITLE)}
			/>
		);
	}

	if (questions.length === 0 && hasFilters) {
		return <Stub type="filter-empty" />;
	}

	return (
		<Flex direction="column" gap="20">
			{questions.map((question) => (
				<Accordion key={question.id} title={question.title}>
					<FullTestQuestionItem
						question={question}
						specialization={specialization}
						locale={locale}
					/>
				</Accordion>
			))}
		</Flex>
	);
};
