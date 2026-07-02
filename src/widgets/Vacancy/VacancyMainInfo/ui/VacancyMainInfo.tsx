import type { VacancyDetails } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';

import { VacancyHeader } from '../../VacancyHeader';
import { VacancySource } from '../../VacancySource';
import { VacancyStats } from '../../VacancyStats';
import { VacancyTags } from '../../VacancyTags';

interface VacancyInfoProps {
	vacancy: VacancyDetails;
}

export const VacancyMainInfo = ({ vacancy }: VacancyInfoProps) => {
	return (
		<Flex gap="20" direction="column">
			<VacancyHeader
				company={vacancy.company}
				title={vacancy.title}
				salary={vacancy.salary}
				applyVacancyUrl={vacancy.applyVacancyUrl}
				skills={vacancy.skills}
				aiProfile={vacancy.aiProfile}
			/>
			<VacancyTags
				workFormat={vacancy.workFormat}
				grade={vacancy.grade}
				employmentForm={vacancy.employmentForm}
				industry={vacancy.industry}
				companyType={vacancy.companyType}
			/>
			<VacancyStats preparation={vacancy.preparation} />
			<VacancySource source={vacancy.source} publishDate={vacancy.sourcePublishedAt} />
		</Flex>
	);
};
