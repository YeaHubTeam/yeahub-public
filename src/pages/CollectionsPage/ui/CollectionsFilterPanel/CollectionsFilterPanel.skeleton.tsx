import { ChooseCollectionAccessSkeleton } from '@/entities/collection';
import { SpecializationsListFieldSkeleton } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { SearchInputSkeleton } from '@/shared/ui/SearchInput';

export const CollectionsFilterPanelSkeleton = () => {
	return (
		<Flex direction="column" gap="24">
			<SearchInputSkeleton />
			<SpecializationsListFieldSkeleton />
			<ChooseCollectionAccessSkeleton />
		</Flex>
	);
};
