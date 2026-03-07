'use client';

import { CardSkeleton } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';
import { ResourcesListSkeleton } from '@/widgets/resources/ResourcesList';

import { ResourcesFilterPanelSkeleton } from '../ResourcesFilterPanel/ResourcesFilterPanel.skeleton';
import { ResourcesPageHeaderSkeleton } from '../ResourcesPageHeader/ResourcesPageHeader.skeleton';
import styles from './ResourcesPage.module.css';

export const ResourcesPageSkeleton = () => {
	return (
		<Flex gap="20" align="start">
			<CardSkeleton className={styles.main}>
				<ResourcesPageHeaderSkeleton />
				<ResourcesListSkeleton />
				<TablePaginationSkeleton />
			</CardSkeleton>
			<CardSkeleton className={styles.filters}>
				<ResourcesFilterPanelSkeleton />
			</CardSkeleton>
		</Flex>
	);
};
