'use client';

import { ListPageWrapperSkeleton } from '@/widgets/ListPageWrapper';
import { ResourcesListSkeleton } from '@/widgets/resources/ResourcesList';

// import { ResourcesFilterPanelSkeleton } from '../ResourcesFilterPanel/ResourcesFilterPanel.skeleton';

const ResourcesFilterPanelSkeleton = () => null;

export const ResourcesPageSkeleton = () => (
	<ListPageWrapperSkeleton
		itemsListSkeleton={<ResourcesListSkeleton />}
		filterPanelSkeleton={<ResourcesFilterPanelSkeleton />}
	/>
);
