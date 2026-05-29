'use client';

import { useTranslations } from 'next-intl';

import { ResourceType, ResourceTypesListField } from '@/entities/resource';
import { GetSkillsListResponse, SkillsListField } from '@/entities/skill';
import {
	GetSpecializationsListResponse,
	Specialization,
	SpecializationsListField,
} from '@/entities/specialization';
import { Resources, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useResourcesFilter } from '../../model/api/useResourcesFilter';

interface ResourcesFilterPanelProps {
	currentSpecialization: Specialization;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	resourcesTypes?: ResourceType[] | null;
}

export const ResourcesFilterPanel = ({
	currentSpecialization,
	initialSpecializations,
	initialSkills,
	resourcesTypes,
}: ResourcesFilterPanelProps) => {
	const t = useTranslations(i18Namespace.resources);
	const { filter, selectedSpecialization, handlers } = useResourcesFilter(currentSpecialization);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Resources.SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
				currentValue={filter.name}
			/>
			<SpecializationsListField
				selectedSpecialization={selectedSpecialization}
				onChangeSpecialization={handlers.onChangeSpecialization}
				initialData={initialSpecializations}
			/>
			<SkillsListField
				selectedSkills={filter.skills}
				onChangeSkills={handlers.onChangeSkills}
				selectedSpecialization={selectedSpecialization}
				initialData={initialSkills}
			/>
			<ResourceTypesListField
				onChangeTypes={handlers.onChangeTypes}
				selectedTypes={filter.types}
				resourcesTypes={resourcesTypes}
			/>
		</Flex>
	);
};
