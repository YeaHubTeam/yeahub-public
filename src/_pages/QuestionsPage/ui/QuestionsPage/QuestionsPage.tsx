import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Questions as QuestionsTranslations, i18Namespace } from '@/shared/config';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { FullQuestionsList } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';

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
	const t = useTranslations(i18Namespace.questions);
	const title = t(QuestionsTranslations.QUESTIONS_TITLE, {
		specialization: currentSpecialization.title,
	});

	return (
		<ListPageWrapper
			locale={locale}
			paginationProps={{
				currentPage: page,
				limit,
				total,
			}}
			title={title}
			itemsList={
				<FullQuestionsList
					questions={questions}
					specialization={specialization}
					hasFilters={hasFilters}
					locale={locale}
				/>
			}
			filterPanel={
				<QuestionsFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					currentSpecialization={currentSpecialization}
				/>
			}
		/>
	);
};
