import { ChooseQuestionComplexitySkeleton, RateFilterSectionSkeleton } from '@/entities/question';
import { SkillsListFieldSkeleton } from '@/entities/skill';
import { SpecializationsListFieldSkeleton } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { SearchInputSkeleton } from '@/shared/ui/SearchInput';

export const QuestionsFilterPanelSkeleton = () => {
	return (
		<Flex direction="column" gap="24">
			<SearchInputSkeleton />
			<SpecializationsListFieldSkeleton />
			<SkillsListFieldSkeleton />
			<ChooseQuestionComplexitySkeleton />
			<RateFilterSectionSkeleton />
		</Flex>
	);
};
