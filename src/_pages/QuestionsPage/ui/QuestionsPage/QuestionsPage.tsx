import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { Question } from '@/entities/question';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';
import { QuestionsPageHeader } from '../QuestionsPageHeader/QuestionsPageHeader';
import { QuestionPagePagination } from '../QuestionsPagePagination/QuestionPagePagination';
import styles from './QuestionsPage.module.css';

interface QuestionsPageProps {
	locale: string;
	page: number;
	questions: Question[];
	total: number;
	limit: number;
	specialization: string;
	hasFilters: boolean;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
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
	currentSpecialization,
}: QuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<QuestionsPageHeader
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
				/>
				<FullQuestionsList
					questions={questions}
					specialization={specialization}
					hasFilters={hasFilters}
					locale={locale}
				/>
				<QuestionPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<QuestionsFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					currentSpecialization={currentSpecialization}
				/>
			</Card>
		</Flex>
	);
};
