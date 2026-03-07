import React from 'react';

import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import { Questions, i18Namespace } from '@/shared/config';
import { Accordion } from '@/shared/ui/Accordion';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { FullQuestionItem } from '../FullQuestionItem/FullQuestionItem';

interface FullQuestionsListProps {
	questions: Question[];
	specialization: string;
	hasFilters: boolean;
}

export const FullQuestionsList = ({
	questions,
	specialization,
	hasFilters,
}: FullQuestionsListProps) => {
	const t = useTranslations(i18Namespace.questions);

	if (questions.length === 0 && !hasFilters) {
		return (
			<Stub
				type="empty"
				title={t(Questions.STUB_EMPTY_TITLE)}
				subtitle={t(Questions.STUB_EMPTY_SUBTITLE)}
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
					<FullQuestionItem question={question} specialization={specialization} />
				</Accordion>
			))}
		</Flex>
	);
};
