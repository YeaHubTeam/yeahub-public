'use client';

import { IconButtonSkeleton } from '@/shared/ui/IconButton';

export const FiltersDrawerSkeleton = () => {
	return (
		<div>
			<IconButtonSkeleton role="status" form="square" size="medium" variant="tertiary" />
		</div>
	);
};
