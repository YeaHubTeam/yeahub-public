import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import type { VacancyPreparation } from '../../model/types/vacancy';
import styles from './VacancyCardPreparation.module.css';

interface VacancyCardPreparationProps {
	preparation: VacancyPreparation;
}

export const VacancyCardPreparation = ({ preparation }: VacancyCardPreparationProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const { collectionsCount, questionsCount, tasksCount } = preparation;

	const vacancyPreparationData = [
		{ count: questionsCount, labelKey: Vacancies.COUNT_QUESTIONS },
		{ count: tasksCount, labelKey: Vacancies.COUNT_TASKS },
		{ count: collectionsCount, labelKey: Vacancies.COUNT_COLLECTIONS },
	];

	return (
		<Card withOutsideShadow className={styles[`preparation-block`]}>
			<Flex gap="10" align="center">
				<Icon icon="refferals" size={14} />
				{vacancyPreparationData
					.filter(({ count }) => count > 0)
					.map(({ count, labelKey }) => (
						<Flex key={labelKey} gap="10" align="center" className={styles.preparation}>
							<Text variant="body1-accent" className={styles[`preparation-text`]}>
								{t(labelKey, { count })}
							</Text>
						</Flex>
					))}
			</Flex>
		</Card>
	);
};
