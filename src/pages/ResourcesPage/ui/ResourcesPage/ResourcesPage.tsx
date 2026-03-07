import { setRequestLocale } from 'next-intl/server';

import { type Resource, ResourceType } from '@/entities/resource';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ResourcesList } from '@/widgets/resources/ResourcesList';

import { ResourcesFilterPanel } from '../ResourcesFilterPanel/ResourcesFilterPanel';
import { ResourcesPageHeader } from '../ResourcesPageHeader/ResourcesPageHeader';
import { ResourcesPagePagination } from '../ResourcesPagePagination/ResourcesPagePagination';
import styles from './ResourcesPage.module.css';

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
	setRequestLocale(locale);
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<ResourcesPageHeader
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					resourcesTypes={resourcesTypes}
				/>
				<ResourcesList resources={resources} hasFilters={hasFilters} />
				<ResourcesPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<ResourcesFilterPanel
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					resourcesTypes={resourcesTypes}
				/>
			</Card>
		</Flex>
	);
};
