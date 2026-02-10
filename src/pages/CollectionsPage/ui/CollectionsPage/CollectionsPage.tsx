import { setRequestLocale } from 'next-intl/server';

import { Collection } from '@/entities/collection';
import { SpecializationSlug } from '@/entities/specialization';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsList, InterviewRecordingsBanner } from '@/widgets/Collection';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';
import { CollectionsPagePagination } from '../CollectionsPagePagination/CollectionsPagePagination';
import styles from './CollectionsPage.module.css';

interface CollectionsPageProps {
	locale: string;
	page: number;
	collections: Collection[];
	total: number;
	limit: number;
	specialization: string;
	hasFilters: boolean;
	specializationSlugs: SpecializationSlug[];
}
export const CollectionsPage = ({
	locale,
	page,
	collections,
	total,
	limit,
	specialization,
	hasFilters,
	specializationSlugs,
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
			<Flex gap="20" direction="column" className={styles.filters}>
				<Card>
					<CollectionsFilterPanel specializationSlugs={specializationSlugs} />
				</Card>
				<InterviewRecordingsBanner />
			</Flex>
		</Flex>
	);
};
