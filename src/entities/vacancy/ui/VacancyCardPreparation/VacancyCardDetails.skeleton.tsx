import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

export const VacancyCardDetailsSkeleton = () => {
	return (
		<Flex justify="between">
			<Flex gap="10">
				<TextSkeleton variant="body3-accent" width={150} />
				<TextSkeleton variant="body3-accent" width={150} />
				<TextSkeleton variant="body3-accent" width={150} />
			</Flex>
			<TextSkeleton variant="body3-accent" width={100} />
		</Flex>
	);
};
