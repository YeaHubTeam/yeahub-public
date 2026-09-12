'use client';

import { useTranslations } from 'next-intl';

import { GetSkillsListResponse, SkillsListField } from '@/entities/skill';
import {
	GetSpecializationsListResponse,
	Specialization,
	SpecializationsListField,
} from '@/entities/specialization';
import {
	ChooseCompanyType,
	ChooseEmploymentType,
	ChooseEnglishLevel,
	ChooseGrade,
	ChooseIndustry,
	ChooseSalary,
	ChooseWorkFormat,
} from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useVacanciesFiter } from '../../api/useVacanciesFilter';

interface VacanciesFilterPanelProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const VacanciesFilterPanel = ({
	currentSpecialization,
	initialSpecializations,
	initialSkills,
}: VacanciesFilterPanelProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	const { filter, selectedSpecialization, handlers } = useVacanciesFiter(currentSpecialization);
	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Vacancies.VACANCIES_SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
			/>
			<ChooseWorkFormat
				selectedFilter={filter.workFormat}
				onChangeFilter={handlers.onChangeWorkFormat}
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
			<ChooseIndustry selectedFilter={filter.industry} onChangeFilter={handlers.onChangeIndustry} />
			<ChooseGrade selectedFilter={filter.grade} onChangeFilter={handlers.onChangeGrade} />
			<ChooseCompanyType
				selectedFilter={filter.companyType}
				onChangeFilter={handlers.onChangeCompanyType}
			/>
			<ChooseEmploymentType
				selectedFilter={filter.employmentType}
				onChangeFilter={handlers.onChangeEmploymentType}
			/>
			<ChooseSalary
				selectedFilter={filter.salaryBucket}
				onChangeFilter={handlers.onChangeSalaryBucket}
			/>
			<ChooseEnglishLevel
				selectedFilter={filter.englishLevel}
				onChangeFilter={handlers.onChangeEnglishLevel}
			/>
		</Flex>
	);
};
