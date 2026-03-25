import { Flex } from '@/shared/ui/Flex';

import { CardBlockLayoutSkeleton } from '../../CardBlockLayout/CardBlockLayout.skeleton';
import { SpecializationChipSkeleton } from '../SpecializationChip/SpecializationChip.skeleton';

export const SpecializationBlockSkeleton = () => {
	return (
		<CardBlockLayoutSkeleton hasOffset>
			{Array.from({ length: 3 }).map((_, i) => (
				<Flex gap="16" key={i}>
					<SpecializationChipSkeleton label="true" />
					<SpecializationChipSkeleton label="true" />
					<SpecializationChipSkeleton label="true" />
				</Flex>
			))}
		</CardBlockLayoutSkeleton>
	);
};
