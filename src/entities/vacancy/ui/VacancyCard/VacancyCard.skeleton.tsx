import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { VacancyCardCompanySkeleton } from '../VacancyCardCompany/VacancyCardCompany.skeleton';
import { VacancyCardDetailsSkeleton } from '../VacancyCardPreparation/VacancyCardDetails.skeleton';
import { VacancyCardSkillsSkeleton } from '../VacancyCardSkills/VacancyCardSkills.skeleton';
import { VacancyCardWorkFormatSkeleton } from '../VacancyCardWorkFormat/VacancyCardWorkFormat.skeleton';
import styles from './VacancyCard.module.css';

export const VacancyCardSkeleton = () => {
	return (
		<Card withOutsideShadow className={styles.content}>
			<Flex gap="40" direction="column">
				<VacancyCardCompanySkeleton />
				<Flex gap="20" direction="column">
					<VacancyCardWorkFormatSkeleton />
					<VacancyCardSkillsSkeleton />
					<VacancyCardDetailsSkeleton />
				</Flex>
			</Flex>
		</Card>
	);
};
