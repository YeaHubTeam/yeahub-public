import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { Collection } from '@/entities/collection';
import { SPEC_MAP } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsList } from '@/widgets/Collection';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';
import { CollectionsPagePagination } from '../CollectionsPagePagination/CollectionsPagePagination';
import styles from './CollectionsPage.module.css';

interface CollectionsPageProps {
	locale: string;
	page: number;
	collections: Collection[];
	total: number;
	limit: number;
	specialization: keyof typeof SPEC_MAP;
	hasFilters: boolean;
}
export const CollectionsPage = ({
	locale,
	page,
	collections,
	total,
	limit,
	specialization,
	hasFilters,
}: CollectionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<CollectionsList
					collections={collections}
					specialization={specialization}
					hasFilters={hasFilters}
				/>

				<CollectionsPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<CollectionsFilterPanel />
			</Card>
		</Flex>
	);
};
