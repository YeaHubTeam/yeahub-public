import React from 'react';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import type { VacancyListItem } from '@/entities/vacancy';
import { VacanciesFilterPanel } from '@/pages/VacanciesPage/ui/VacanciesFilterPanel/VacanciesFilterPanel';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { VacanciesList } from '@/widgets/Vacancy';

interface VacanciesPageProps {
	vacancies: VacancyListItem[];
	page: number;
	total: number;
	limit: number;
	title: string;
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
	locale: string;
	hasFilters: boolean;
}

export const VacanciesPage = ({
	vacancies,
	page,
	total,
	limit,
	title,
	initialSpecializations,
	initialSkills,
	currentSpecialization,
	locale,
	hasFilters,
}: VacanciesPageProps) => {
	return (
		<ListPageWrapper
			page={page}
			total={total}
			limit={limit}
			title={title}
			filters={
				<VacanciesFilterPanel
					initialSpecializations={initialSpecializations}
					initialSkills={initialSkills}
					currentSpecialization={currentSpecialization}
				/>
			}
		>
			<VacanciesList
				vacancies={vacancies}
				hasFilters={hasFilters}
				locale={locale}
				specialization={currentSpecialization.slug}
			/>
		</ListPageWrapper>
	);
};
