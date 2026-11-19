import React from 'react';

import { useTranslations } from 'next-intl';

import { getStudyStatus, QuestionStudyStatus } from '@/entities/question';
import type { QuestionListItem, QuestionListActions } from '@/entities/question';
import { Questions, i18Namespace } from '@/shared/config';
import { Accordion } from '@/shared/ui/Accordion';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { FullQuestionItem } from '../FullQuestionItem/FullQuestionItem';

import styles from './FullQuestionsList.module.css';

interface FullQuestionsListProps {
	questions: QuestionListItem[];
	specialization: string;
	hasFilters: boolean;
	locale: string;
	navigationSearch?: string;
	actions?: QuestionListActions;
	// Supplied only for an authenticated profile; absent rows have no known study status.
	personalState?: {
		hasPremiumAccess: boolean;
		userId: string;
		profileId: string;
		isEmailVerified: boolean;
		studyStateByQuestionId: Readonly<Partial<Record<number, { checksCount: number; isLearned: boolean }>>>;
	};
}

export const FullQuestionsList = ({
	questions,
	specialization,
	hasFilters,
	locale,
	navigationSearch,
	personalState,
	actions,
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
			{questions.map((question) => {
				const study = personalState?.studyStateByQuestionId[question.id];
				const status = personalState?.hasPremiumAccess && study &&
					Number.isSafeInteger(study.checksCount) && study.checksCount >= 0 &&
					typeof study.isLearned === 'boolean'
					? getStudyStatus(study.checksCount)
					: undefined;
				return (
					<Accordion key={question.id} title={question.title} className={styles.question}
						prefix={status ? <QuestionStudyStatus status={status} /> : undefined}>
						<FullQuestionItem
							actions={actions}
							actionsState={personalState ? {
								userId: personalState.userId, profileId: personalState.profileId,
								isEmailVerified: personalState.isEmailVerified,
								isFavorite: question.isFavorite, isLearned: study?.isLearned,
								checksCount: study?.checksCount,
								hasPremium: personalState.hasPremiumAccess,
							} : undefined}
							navigationSearch={navigationSearch} question={question} specialization={specialization} locale={locale} />
					</Accordion>
				);
			})}
		</Flex>
	);
};
