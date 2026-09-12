import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { ListPageWrapperHeader } from '../ListPageWrapperHeader/ListPageWrapperHeader';
import {
	ListPageWrapperPagination,
	type ListPageWrapperPaginationProps,
} from '../ListPageWrapperPagination/ListPageWrapperPagination';
import styles from './ListPageWrapper.module.css';

export interface ListPageWrapperProps {
	locale: string;
	title: string;
	paginationProps?: ListPageWrapperPaginationProps;
	itemsList: React.ReactNode;
	filterPanel: React.ReactNode;
}

export const ListPageWrapper = ({
	locale,
	title,
	paginationProps,
	itemsList,
	filterPanel,
}: ListPageWrapperProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card withOutsideShadow className={styles.main}>
				<ListPageWrapperHeader title={title} filterPanel={filterPanel} />
				{itemsList}
				{paginationProps ? <ListPageWrapperPagination {...paginationProps} /> : null}
			</Card>
			<Flex className={styles.filters}>
				<Card>{filterPanel}</Card>
			</Flex>
		</Flex>
	);
};
