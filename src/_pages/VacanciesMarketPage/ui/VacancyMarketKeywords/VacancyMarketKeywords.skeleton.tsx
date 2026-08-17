import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

export const VacancyMarketKeywordsSkeleton = () => {
	return (
		<Flex componentType="section" direction="column" gap="12">
			<TextSkeleton variant="body3-accent" width={140} />

			<Flex align="end" gap="12" wrap="wrap">
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton key={index} width={100} height={index === 0 ? 52 : 42} borderRadius={12} />
				))}
			</Flex>
		</Flex>
	);
};
