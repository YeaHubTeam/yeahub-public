import { CollectionsPreviewSkeleton } from '@/entities/collection';
import { Flex } from '@/shared/ui/Flex';

export const CollectionsListSkeleton = () => {
	return (
		<Flex direction="column" gap="20">
			{[...Array(6)].map((_, i) => (
				<CollectionsPreviewSkeleton key={i} />
			))}
		</Flex>
	);
};
