import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

export const VacancyMarketSkillsSkeleton = () => {
	return (
		<Flex componentType="section" direction="column" gap="12">
			<TextSkeleton variant="body3-accent" width={120} />

			<Flex direction="column" gap="8">
				{Array.from({ length: 5 }).map((_, index) => (
					<Flex direction="column" gap="4" key={index}>
						<Flex justify="between" align="center" gap="8">
							<TextSkeleton variant="body2" width={100} />
							<TextSkeleton variant="body2" width={32} />
						</Flex>

						<Skeleton width="100%" height={6} borderRadius={21} />
					</Flex>
				))}
			</Flex>
		</Flex>
	);
};
