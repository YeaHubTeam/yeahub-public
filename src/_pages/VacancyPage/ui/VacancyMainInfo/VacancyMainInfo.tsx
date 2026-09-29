import type { Vacancy } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';

import { VacancyActions } from '../VacancyActions/VacancyActions';
import { VacancyHeader } from '../VacancyHeader/VacancyHeader';
import { VacancySource } from '../VacancySource/VacancySource';
import { VacancyStats } from '../VacancyStats/VacancyStats';
import { VacancyTags } from '../VacancyTags/VacancyTags';

interface VacancyInfoProps {
	vacancy: Vacancy;
}

export const VacancyMainInfo = ({ vacancy }: VacancyInfoProps) => {
	return (
		<Flex gap="20" direction="column">
			<VacancyHeader company={vacancy.company} title={vacancy.title} salary={vacancy.salary} />
			<VacancyActions applyVacancyUrl={vacancy.applyVacancyUrl} />
			<VacancyTags
				area={vacancy.area}
				grade={vacancy.grade}
				employmentForm={vacancy.employmentForm}
				industry={vacancy.industry}
				companyType={vacancy.companyType}
			/>
			<VacancyStats preparation={vacancy.preparation} />
			<VacancySource
				source={vacancy.source}
				sourcePublishedAt={vacancy.sourcePublishedAt}
				internship={vacancy.internship}
				workFormat={vacancy.workFormat}
			/>
		</Flex>
	);
};
