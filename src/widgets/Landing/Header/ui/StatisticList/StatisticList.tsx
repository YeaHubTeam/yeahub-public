import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './StatisticList.module.css';

const statistics = [
	{
		title: Landing.HEADER_STATISTICS_QUESTIONS_COUNT,
		subtitle: Landing.HEADER_STATISTICS_QUESTIONS_TEXT,
	},
	{
		title: Landing.HEADER_STATISTICS_TASKS_COUNT,
		subtitle: Landing.HEADER_STATISTICS_TASKS_TEXT,
	},
	{
		title: Landing.HEADER_STATISTICS_COMPANIES_COUNT,
		subtitle: Landing.HEADER_STATISTICS_COMPANIES_TEXT,
	},
	{
		title: Landing.HEADER_STATISTICS_SPECIALIZATIONS_COUNT,
		subtitle: Landing.HEADER_STATISTICS_SPECIALIZATIONS_TEXT,
	},
	{
		title: Landing.HEADER_STATISTICS_SKILLS_COUNT,
		subtitle: Landing.HEADER_STATISTICS_SKILLS_TEXT,
	},
	{
		subtitle: Landing.HEADER_STATISTICS_INFO_TEXT,
	},
];

export const StatisticList = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<div className={styles.list}>
			{statistics.map((statistic) => (
				<Flex
					key={statistic.title + statistic.subtitle}
					justify="center"
					align="center"
					direction="column"
					className={styles.card}
				>
					{statistic.title && (
						<Text variant="body3-accent" className={styles.title}>
							{t(statistic.title)}
						</Text>
					)}
					<Text variant="body3-accent" className={styles.subtitle}>
						{t(statistic.subtitle)}
					</Text>
				</Flex>
			))}
		</div>
	);
};
