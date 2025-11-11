'use client';

import { useTranslations } from 'next-intl';

import { ChooseQuestionComplexity, RateFilterSection } from '@/entities/question';
import { SkillsListField } from '@/entities/skill';
import { MediaLinksBanner } from '@/entities/socialMedia';
import { SpecializationsListField } from '@/entities/specialization';
import { Questions, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useQuestionsFilter } from './model/useQuestionsFilter';

export const QuestionsFilterPanel = () => {
	const t = useTranslations(i18Namespace.questions);
	const { filter, selectedSpecialization, media, handlers } = useQuestionsFilter();

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
			/>
			<SkillsListField
				selectedSkills={filter.skills}
				onChangeSkills={handlers.onChangeSkills}
				selectedSpecialization={selectedSpecialization}
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
