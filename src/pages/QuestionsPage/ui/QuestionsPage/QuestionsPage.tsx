import React from 'react';

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Question } from '@/entities/question';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse } from '@/entities/specialization';
import { Questions, i18Namespace } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';
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
	hasFilters: boolean;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
}

export const QuestionsPage = ({
	locale,
	page,
	questions,
	total,
	limit,
	specialization,
	hasFilters,
	initialSpecializations,
	initialSkills,
}: QuestionsPageProps) => {
	setRequestLocale(locale);

	const t = useTranslations(i18Namespace.questions);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<FullQuestionsList questions={questions} specialization={specialization} />

				<QuestionPagePagination total={total} limit={limit} currentPage={page} />

				{questions.length === 0 ? (
					hasFilters ? (
						<Stub type="filter-empty" />
					) : (
						<Stub
							type="empty"
							title={t(Questions.STUB_EMPTY_TITLE)}
							subtitle={t(Questions.STUB_EMPTY_SUBTITLE)}
						/>
					)
				) : null}
			</Card>
			<Card className={styles.filters}>
				<QuestionsFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
				/>
			</Card>
		</Flex>
	);
};
