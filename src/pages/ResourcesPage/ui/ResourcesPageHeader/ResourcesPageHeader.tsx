import React from 'react';

import { useTranslations } from 'next-intl';

import { ResourceType } from '@/entities/resource';
import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Resources, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { ResourcesFilterPanel } from '../ResourcesFilterPanel/ResourcesFilterPanel';
import styles from './ResourcesPageHeader.module.css';

interface ResourcesPageHeaderProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	resourcesTypes?: ResourceType[] | null;
	currentSpecialization: Specialization;
}

export const ResourcesPageHeader = ({
	initialSpecializations,
	initialSkills,
	currentSpecialization,
	resourcesTypes,
}: ResourcesPageHeaderProps) => {
	const t = useTranslations(i18Namespace.resources);

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{t(Resources.HEADER_TITLE)}
				</Text>
				<FiltersDrawer>
					<ResourcesFilterPanel
						initialSpecializations={initialSpecializations}
						initialSkills={initialSkills}
						currentSpecialization={currentSpecialization}
						resourcesTypes={resourcesTypes}
					/>
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
