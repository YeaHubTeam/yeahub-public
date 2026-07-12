import { setRequestLocale } from 'next-intl/server';

import { type Resource, ResourceType } from '@/entities/resource';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { ResourcesList } from '@/widgets/resources/ResourcesList';

import { ResourcesFilterPanel } from '../ResourcesFilterPanel/ResourcesFilterPanel';

interface ResourcesPageProps {
	locale: string;
	page: number;
	resources: Resource[];
	total: number;
	limit: number;
	title: string;
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
	title,
	limit,
	hasFilters,
	currentSpecialization,
	initialSpecializations,
	initialSkills,
	resourcesTypes,
}: ResourcesPageProps) => {
	setRequestLocale(locale);
	return (
		<ListPageWrapper
			page={page}
			total={total}
			limit={limit}
			title={title}
			filters={
				<ResourcesFilterPanel
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					resourcesTypes={resourcesTypes}
				/>
			}
		>
			<ResourcesList resources={resources} hasFilters={hasFilters} />
		</ListPageWrapper>
	);
};
