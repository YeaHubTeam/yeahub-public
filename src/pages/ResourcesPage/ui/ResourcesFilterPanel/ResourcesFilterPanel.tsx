'use client';

import { useTranslations } from 'next-intl';

import { ResourceTypesListField } from '@/entities/resource';
import { SkillsListField } from '@/entities/skill';
import { SpecializationsListField } from '@/entities/specialization';
import { Resources, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useResourcesFilter } from '../../model/api/useResourcesFilter';

export const ResourcesFilterPanel = () => {
	const t = useTranslations(i18Namespace.resources);
	const { filter, selectedSpecialization, handlers } = useResourcesFilter();

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
			/>
			<SkillsListField
				selectedSkills={filter.skills}
				onChangeSkills={handlers.onChangeSkills}
				selectedSpecialization={selectedSpecialization}
			/>
			<ResourceTypesListField onChangeTypes={handlers.onChangeTypes} selectedTypes={filter.types} />
		</Flex>
	);
};
