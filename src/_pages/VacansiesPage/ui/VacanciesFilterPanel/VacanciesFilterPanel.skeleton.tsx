import { SkillsListFieldSkeleton } from '@/entities/skill';
import { SpecializationsListFieldSkeleton } from '@/entities/specialization';
import {
	ChoiceIndustrySkeleton,
	ChoiceWorkFormatSkeleton,
	ChoiseCompanyTypeSkeleton,
	ChoiseEmploymentTypeSkeleton,
	ChoiseEnglishLevelSkeleton,
	ChoiseGradeSkeleton,
	ChoiseSalarySkeleton,
} from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';
import { SearchInputSkeleton } from '@/shared/ui/SearchInput';

export const VacanciesFilterPanelSkeleton = () => {
	return (
		<Flex direction="column" gap="24">
			<SearchInputSkeleton />
			<ChoiceWorkFormatSkeleton />
			<SpecializationsListFieldSkeleton />
			<SkillsListFieldSkeleton />
			<ChoiceIndustrySkeleton />
			<ChoiseGradeSkeleton />
			<ChoiseCompanyTypeSkeleton />
			<ChoiseEmploymentTypeSkeleton />
			<ChoiseSalarySkeleton />
			<ChoiseEnglishLevelSkeleton />
		</Flex>
	);
};
