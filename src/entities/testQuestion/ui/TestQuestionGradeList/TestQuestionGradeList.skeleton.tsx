import { Flex } from '@/shared/ui/Flex';
import { GradeChipSkeleton } from '@/shared/ui/GradeChip';

import { TestQuestionGradeListProps } from './TestQuestionGradeList';

export const TestQuestionGradeListSkeleton = ({
	className,
	size,
}: Partial<TestQuestionGradeListProps>) => {
	return (
		<Flex componentType="ul" gap="24" className={className}>
			<GradeChipSkeleton size={size} />
			<GradeChipSkeleton size={size} />
		</Flex>
	);
};
