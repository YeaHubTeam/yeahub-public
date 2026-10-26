import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { TestQuestion } from '@/entities/testQuestion';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { FullTestQuestionsList } from '@/widgets/testQuestion/TestQuestionsList';

import { TestQuestionsPageHeader } from '../TestQuestionsPageHeader/TestQuestionsPageHeader';
import { TestQuestionsPagePagination } from '../TestQuestionsPagePagination/TestQuestionsPagePagination';
import styles from './TestQuestionsPage.module.css';

interface TestQuestionsPageProps {
	locale: string;
	page: number;
	questions: TestQuestion[];
	total: number;
	limit: number;
	specialization: string;
	hasFilters?: boolean;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const TestQuestionsPage = ({
	locale,
	page,
	questions,
	total,
	limit,
	specialization,
	hasFilters,
	currentSpecialization,
}: TestQuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<TestQuestionsPageHeader currentSpecialization={currentSpecialization} />
				<FullTestQuestionsList
					questions={questions}
					specialization={specialization}
					hasFilters={hasFilters}
					locale={locale}
				/>
				<TestQuestionsPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
		</Flex>
	);
};
