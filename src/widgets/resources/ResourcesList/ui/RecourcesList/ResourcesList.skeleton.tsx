import { ResourceCardSkeleton } from '@/entities/resource';
import { Flex } from '@/shared/ui/Flex';

export const ResourcesListSkeleton = () => {
	return (
		<Flex direction="column" gap="20">
			{[...Array(6)].map((_, i) => (
				<ResourceCardSkeleton key={i} />
			))}
		</Flex>
	);
};
