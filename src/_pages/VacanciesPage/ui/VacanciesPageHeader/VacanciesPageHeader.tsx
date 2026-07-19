import React from 'react';

import { useTranslations } from 'next-intl';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Vacancies, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { VacanciesFilterPanel } from '../VacanciesFilterPanel/VacanciesFilterPanel';
import styles from './VacanciesPageHeader.module.css';

interface VacanciesPageHeaderProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const VacanciesPageHeader = ({
	initialSpecializations,
	initialSkills,
	currentSpecialization,
}: VacanciesPageHeaderProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const title = t(Vacancies.LIST_PAGE_TITLE, {
		specialization: currentSpecialization.title,
	});

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
				<FiltersDrawer>
					<VacanciesFilterPanel
						initialSpecializations={initialSpecializations}
						initialSkills={initialSkills}
						currentSpecialization={currentSpecialization}
					/>
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
