import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

export const VacancyCardWorkFormatSkeleton = () => {
	return (
		<Flex gap="6">
			<TextSkeleton variant="body3-accent" width={80} />
			<TextSkeleton variant="body3-accent" width={80} />
			<TextSkeleton variant="body3-accent" width={80} />
			<TextSkeleton variant="body3-accent" width={80} />
		</Flex>
	);
};
