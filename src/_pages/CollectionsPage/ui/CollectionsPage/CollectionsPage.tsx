import { useTranslations } from 'next-intl';

import { Collection } from '@/entities/collection';
import { GetCompaniesResponse } from '@/entities/company';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Collections, i18Namespace } from '@/shared/config';
import { CollectionsList } from '@/widgets/Collection';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';

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
	initialCompanies?: GetCompaniesResponse | null;
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
	initialCompanies,
}: CollectionsPageProps) => {
	const t = useTranslations(i18Namespace.collection);

	const title = t(Collections.COLLECTIONS_TITLE, {
		specialization: currentSpecialization.title,
	});

	return (
		<ListPageWrapper
			locale={locale}
			paginationProps={{
				currentPage: page,
				limit,
				total,
			}}
			title={title}
			itemsList={
				<CollectionsList
					collections={collections}
					specialization={specialization}
					hasFilters={hasFilters}
					locale={locale}
				/>
			}
			filterPanel={
				<CollectionsFilterPanel
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialCompanies={initialCompanies}
				/>
			}
		/>
	);
};
