import { ResourceTypesListFieldSkeleton } from '@/entities/resource';
import { SkillsListFieldSkeleton } from '@/entities/skill';
import { SpecializationsListFieldSkeleton } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { SearchInputSkeleton } from '@/shared/ui/SearchInput';

export const ResourcesFilterPanelSkeleton = () => {
	return (
		<Flex direction="column" gap="24">
			<SearchInputSkeleton />
			<SpecializationsListFieldSkeleton />
			<SkillsListFieldSkeleton />
			<ResourceTypesListFieldSkeleton />
		</Flex>
	);
};
