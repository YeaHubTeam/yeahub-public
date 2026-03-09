'use client';

import { useTranslations } from 'next-intl';

import { ChooseQuestionComplexity, RateFilterSection } from '@/entities/question';
import { GetSkillsListResponse, SkillsListField } from '@/entities/skill';
import { MediaLinksBanner } from '@/entities/socialMedia';
import {
	GetSpecializationsListResponse,
	Specialization,
	SpecializationsListField,
} from '@/entities/specialization';
import { Questions, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useQuestionsFilter } from '../../model/api/useQuestionsFilter';

interface QuestionsFilterPanelProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const QuestionsFilterPanel = ({
	initialSpecializations,
	initialSkills,
	currentSpecialization,
}: QuestionsFilterPanelProps) => {
	const t = useTranslations(i18Namespace.questions);
	const { filter, selectedSpecialization, media, handlers } =
		useQuestionsFilter(currentSpecialization);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Questions.QUESTIONS_SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
				currentValue={filter.title}
			/>
			<SpecializationsListField
				selectedSpecialization={selectedSpecialization}
				onChangeSpecialization={handlers.onChangeSpecialization}
				initialData={initialSpecializations}
			/>
			<SkillsListField
				selectedSkills={filter.skills}
				onChangeSkills={handlers.onChangeSkills}
				selectedSpecialization={selectedSpecialization}
				initialData={initialSkills}
			/>
			<ChooseQuestionComplexity
				onChangeComplexity={handlers.onChangeComplexity}
				selectedComplexity={filter.complexity}
			/>
			<RateFilterSection onChangeRate={handlers.onChangeRate} selectedRate={filter.rate} />
			{media && <MediaLinksBanner mediaLink={media} />}
		</Flex>
	);
};
