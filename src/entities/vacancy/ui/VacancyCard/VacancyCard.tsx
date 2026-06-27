import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { Vacancy } from '../../model/types/vacancy';
import { VacancyCardCompany } from '../VacancyCardCompany/VacancyCardCompany';
import { VacancyCardDetails } from '../VacancyCardPreparation/VacancyCardDetails';
import { VacancyCardSkills } from '../VacancyCardSkills/VacancyCardSkills';
import { VacancyCardWorkFormat } from '../VacancyCardWorkFormat/VacancyCardWorkFormat';
import styles from './VacancyCard.module.css';

interface VacancyCardProps {
	vacancy: Vacancy;
}

export const VacancyCard = ({ vacancy }: VacancyCardProps) => {
	const {
		company,
		title,
		employmentForm,
		grade,
		workFormat,
		area,
		skills,
		publishedAt,
		preparation,
		salary,
	} = vacancy;

	return (
		<Card withOutsideShadow className={styles.content}>
			<Flex gap="40" direction="column">
				<VacancyCardCompany company={company} publishedAt={publishedAt} title={title} />
				<Flex gap="20" direction="column">
					<VacancyCardWorkFormat
						employmentForm={employmentForm}
						grade={grade}
						workFormat={workFormat}
						area={area}
					/>
					<VacancyCardSkills skills={skills} />
					<VacancyCardDetails preparation={preparation} salary={salary} />
				</Flex>
			</Flex>
		</Card>
	);
};
