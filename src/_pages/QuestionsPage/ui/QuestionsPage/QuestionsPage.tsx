import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import type { QuestionListItem, QuestionListActions } from '@/entities/question';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { FullQuestionsList, FullQuestionsListSkeleton } from '@/widgets/question/QuestionsList';

import { QuestionListPersonalState, QuestionListContent } from '../QuestionListPersonalState';
import type { PersonalListViewResult, QuestionsListScope } from '../QuestionListPersonalState';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';
import { QuestionsPageHeader } from '../QuestionsPageHeader/QuestionsPageHeader';
import { QuestionPagePagination } from '../QuestionsPagePagination/QuestionPagePagination';
import styles from './QuestionsPage.module.css';

interface QuestionsPageProps {
	locale: string;
	initialResult: PersonalListViewResult | null;
	readScope: () => Promise<QuestionsListScope>;
	questionActions: QuestionListActions;
	serverUserId: string | null;
	serverSource: 'public' | 'personal';
	serverRevision: string;
	navigationSearch?: string;
	page: number;
	questions: QuestionListItem[];
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
	initialResult, readScope, questionActions, serverUserId, serverSource, serverRevision,
	navigationSearch,
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

	const studyStateByQuestionId: Record<number, { checksCount: number; isLearned: boolean }> = {};
	if (serverSource === 'personal' && initialResult?.status === 'success') {
		for (const question of questions) {
			if (typeof question.checksCount === 'number' && typeof question.isLearned === 'boolean') {
				studyStateByQuestionId[question.id] = {
					checksCount: question.checksCount,
					isLearned: question.isLearned,
				};
			}
		}
	}
	const listContent = <>
		<FullQuestionsList
			actions={questionActions}
			personalState={serverSource === 'personal' && initialResult?.status === 'success'
				? { hasPremiumAccess: initialResult.hasPremiumAccess, studyStateByQuestionId,
					userId: initialResult.userId, profileId: initialResult.profileId, isEmailVerified: initialResult.isVerified }
				: undefined}
			navigationSearch={navigationSearch} questions={questions}
			specialization={specialization} hasFilters={hasFilters} locale={locale} />
		<QuestionPagePagination total={total} limit={limit} currentPage={page} />
	</>;
	const seededResult = initialResult?.status === 'success'
		? { ...initialResult, content: listContent } : initialResult;
	return (
		<QuestionListPersonalState
			initialResult={seededResult} readScope={readScope} serverUserId={serverUserId} serverSource={serverSource}
			serverRevision={serverRevision} serverQuery={navigationSearch ?? ''}
		>
			<Flex gap="20" align="start">
				<Card className={styles.main}>
					<QuestionsPageHeader
						currentSpecialization={currentSpecialization}
						initialSpecializations={initialSpecializations}
						initialSkills={initialSkills}
					/>
					<QuestionListContent fallback={<FullQuestionsListSkeleton />}>
						{listContent}
					</QuestionListContent>
				</Card>
				<Card className={styles.filters}>
					<QuestionsFilterPanel
						initialSpecializations={initialSpecializations}
						initialSkills={initialSkills}
						currentSpecialization={currentSpecialization}
					/>
				</Card>
			</Flex>
		</QuestionListPersonalState>
	);
};
