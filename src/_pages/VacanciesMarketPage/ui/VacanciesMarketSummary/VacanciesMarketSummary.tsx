import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import GrowthChart from '@/shared/assets/images/growthChart.png';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './VacanciesMarketSummary.module.css';

interface VacanciesMarketSummaryProps {
	total: number;
}

export const VacanciesMarketSummary = async ({ total }: VacanciesMarketSummaryProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.summary}
			contentClassName={styles.content}
		>
			<div className={styles.main}>
				<div className={styles['icon-slot']}>
					<Image
						src={GrowthChart}
						width={44}
						height={44}
						alt=""
						aria-hidden
						className={styles['growth-chart']}
					/>
				</div>

				<div className={styles.value}>
					<Text variant="body1" color="black-900" className={styles.title}>
						{t(Vacancies.MARKET_PAGE_TOTAL_ANALYZED)}
					</Text>

					<Text variant="body3-accent" color="purple-700" className={styles.count}>
						{total}
					</Text>
				</div>
			</div>

			<div className={styles.note}>
				<Icon icon="info" size={16} aria-hidden />

				<Text variant="body1" color="black-600" className={styles['note-text']}>
					{t(Vacancies.MARKET_PAGE_DAILY_UPDATE)}
				</Text>
			</div>
		</Card>
	);
};
