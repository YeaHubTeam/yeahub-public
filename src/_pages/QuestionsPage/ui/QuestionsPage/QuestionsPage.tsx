import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { Question } from '@/entities/question';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';

interface QuestionsPageProps {
	locale: string;
	page: number;
	questions: Question[];
	total: number;
	limit: number;
	title: string;
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
	title,
	specialization,
	hasFilters,
	initialSpecializations,
	initialSkills,
	currentSpecialization,
}: QuestionsPageProps) => {
	setRequestLocale(locale);

	return (
		<ListPageWrapper
			page={page}
			total={total}
			limit={limit}
			title={title}
			filters={
				<QuestionsFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					currentSpecialization={currentSpecialization}
				/>
			}
		>
			<FullQuestionsList
				questions={questions}
				specialization={specialization}
				hasFilters={hasFilters}
				locale={locale}
			/>
		</ListPageWrapper>
	);
};
