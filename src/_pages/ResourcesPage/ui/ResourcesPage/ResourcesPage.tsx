import { useTranslations } from 'next-intl';

import { type Resource, ResourceType } from '@/entities/resource';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Resources, i18Namespace } from '@/shared/config';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { ResourcesList } from '@/widgets/resources/ResourcesList';

import { ResourcesFilterPanel } from '../ResourcesFilterPanel/ResourcesFilterPanel';

interface ResourcesPageProps {
	locale: string;
	page: number;
	resources: Resource[];
	total: number;
	limit: number;
	hasFilters: boolean;
	currentSpecialization: Specialization;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	resourcesTypes?: ResourceType[] | null;
}

export const ResourcesPage = ({
	locale,
	page,
	resources,
	total,
	limit,
	hasFilters,
	currentSpecialization,
	initialSpecializations,
	initialSkills,
	resourcesTypes,
}: ResourcesPageProps) => {
	const t = useTranslations(i18Namespace.resources);

	return (
		<ListPageWrapper
			locale={locale}
			paginationProps={{
				currentPage: page,
				limit,
				total,
			}}
			title={t(Resources.HEADER_TITLE)}
			itemsList={<ResourcesList resources={resources} hasFilters={hasFilters} />}
			filterPanel={
				<ResourcesFilterPanel
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					resourcesTypes={resourcesTypes}
				/>
			}
		/>
	);
};
