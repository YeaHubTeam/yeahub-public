import { setRequestLocale } from 'next-intl/server';

import { Collection } from '@/entities/collection';
import { GetCompaniesResponse } from '@/entities/company';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { CollectionsList, InterviewRecordingsBanner } from '@/widgets/Collection';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';

interface CollectionsPageProps {
	locale: string;
	page: number;
	collections: Collection[];
	total: number;
	limit: number;
	title: string;
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
	title,
	limit,
	specialization,
	hasFilters,
	currentSpecialization,
	initialSpecializations,
	initialCompanies,
}: CollectionsPageProps) => {
	setRequestLocale(locale);

	return (
		<ListPageWrapper
			page={page}
			total={total}
			limit={limit}
			title={title}
			filters={
				<CollectionsFilterPanel
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialCompanies={initialCompanies}
				/>
			}
			banner={<InterviewRecordingsBanner />}
		>
			<CollectionsList
				collections={collections}
				specialization={specialization}
				hasFilters={hasFilters}
				locale={locale}
			/>
		</ListPageWrapper>
	);
};
