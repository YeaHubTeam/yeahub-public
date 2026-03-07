import { setRequestLocale } from 'next-intl/server';

import { Collection } from '@/entities/collection';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsList, InterviewRecordingsBanner } from '@/widgets/Collection';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';
import { CollectionsPageHeader } from '../CollectionsPageHeader/CollectionsPageHeader';
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
	currentSpecialization: Specialization;
	initialSpecializations?: GetSpecializationsListResponse | null;
}
export const CollectionsPage = ({
	locale,
	page,
	collections,
	total,
	limit,
	specialization,
	hasFilters,
	currentSpecialization,
	initialSpecializations,
}: CollectionsPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<CollectionsPageHeader
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
				/>
				<CollectionsList
					collections={collections}
					specialization={specialization}
					hasFilters={hasFilters}
				/>
				<CollectionsPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Flex gap="20" direction="column" className={styles.filters}>
				<Card>
					<CollectionsFilterPanel
						currentSpecialization={currentSpecialization}
						initialSpecializations={initialSpecializations}
					/>
				</Card>
				<InterviewRecordingsBanner />
			</Flex>
		</Flex>
	);
};
