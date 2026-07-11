import React from 'react';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import type { VacancyListItem } from '@/entities/vacancy';
import { VacanciesFilterPanel } from '@/pages/VacanciesPage/ui/VacanciesFilterPanel/VacanciesFilterPanel';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { VacanciesList } from '@/widgets/Vacancy';

import { VacanciesPageHeader } from '../VacanciesPageHeader/VacanciesPageHeader';
import { VacanciesPagePagination } from '../VacanciesPagePagination/VacanciesPagePagination';
import styles from './VacanciesPage.module.css';

interface VacanciesPageProps {
	vacancies: VacancyListItem[];
	page: number;
	total: number;
	limit: number;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
	locale: string;
}

export const VacanciesPage = ({
	vacancies,
	page,
	total,
	limit,
	initialSpecializations,
	initialSkills,
	currentSpecialization,
	locale,
}: VacanciesPageProps) => {
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<VacanciesPageHeader
					currentSpecialization={currentSpecialization}
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
				/>
				<VacanciesList
					vacancies={vacancies}
					locale={locale}
					specialization={currentSpecialization.slug}
				/>
				<VacanciesPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<VacanciesFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					currentSpecialization={currentSpecialization}
				/>
			</Card>
		</Flex>
	);
};
