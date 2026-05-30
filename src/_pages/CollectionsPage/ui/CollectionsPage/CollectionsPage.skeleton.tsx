'use client';

import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';
import { CollectionsListSkeleton } from '@/widgets/Collection';

import { CollectionsFilterPanelSkeleton } from '../CollectionsFilterPanel/CollectionsFilterPanel.skeleton';
import { CollectionsPageHeaderSkeleton } from '../CollectionsPageHeader/CollectionsPageHeader.skeleton';
import styles from './CollectionsPage.module.css';

export const CollectionsPageSkeleton = () => {
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<CollectionsPageHeaderSkeleton />
				<CollectionsListSkeleton />
				<TablePaginationSkeleton />
			</Card>
			<Flex gap="20" direction="column" className={styles.filters}>
				<Card>
					<CollectionsFilterPanelSkeleton />
				</Card>
			</Flex>
		</Flex>
	);
};
