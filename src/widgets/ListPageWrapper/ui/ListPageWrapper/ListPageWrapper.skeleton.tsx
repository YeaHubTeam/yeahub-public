'use client';

import React from 'react';

import { CardSkeleton } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';

import { ListPageWrapperHeaderSkeleton } from '../ListPageWrapperHeader/ListPageWrapperHeader.skeleton';
import styles from './ListPageWrapper.module.css';

interface ListPageWrapperSkeletonProps {
	itemsListSkeleton: React.ReactNode;
	filterPanelSkeleton: React.ReactNode;
}

export const ListPageWrapperSkeleton = ({
	itemsListSkeleton,
	filterPanelSkeleton,
}: ListPageWrapperSkeletonProps) => {
	return (
		<Flex gap="20" align="start">
			<CardSkeleton className={styles.main}>
				<ListPageWrapperHeaderSkeleton />
				{itemsListSkeleton}
				<TablePaginationSkeleton />
			</CardSkeleton>
			<CardSkeleton className={styles.filters}>{filterPanelSkeleton}</CardSkeleton>
		</Flex>
	);
};
