import { useTranslations } from 'next-intl';

import { VacancyPreparation } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { VacancyStatItem } from './VacancyStatItem/VacancyStatItem';
import styles from './VacancyStats.module.css';

interface VacancyStatsProps {
	preparation: VacancyPreparation;
}

export const VacancyStats = ({ preparation }: VacancyStatsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const { collectionsCount, questionsCount, tasksCount } = preparation;

	const hasResource = collectionsCount > 0 || questionsCount > 0 || tasksCount > 0;
	if (!hasResource) {
		return null;
	}

	return (
		<Flex gap="95" maxWidth className={styles['stats-block']}>
			<Flex gap="14" align="center">
				<Icon icon="target" color="purple-700" size={38} className={styles.icon} />
				<Text variant="body3-accent" color="black-900" isNoWrap>
					{t(Vacancies.STATS_TITLE)}
				</Text>
			</Flex>

			<Flex wrap="wrap" maxWidth className={styles['stats-list']}>
				{collectionsCount > 0 && (
					<VacancyStatItem
						value={collectionsCount}
						label={t(Vacancies.STATS_INTERVIEWS, { count: collectionsCount })}
					/>
				)}
				{tasksCount > 0 && (
					<VacancyStatItem
						value={tasksCount}
						label={t(Vacancies.STATS_TASKS, { count: tasksCount })}
					/>
				)}
				{questionsCount > 0 && (
					<VacancyStatItem
						value={questionsCount}
						label={t(Vacancies.STATS_QUESTIONS, { count: questionsCount })}
					/>
				)}
			</Flex>
		</Flex>
	);
};
