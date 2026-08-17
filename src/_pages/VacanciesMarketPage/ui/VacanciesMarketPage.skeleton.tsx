import { Flex } from '@/shared/ui/Flex';

import { VacanciesMarketHeaderSkeleton } from './VacanciesMarketHeader/VacanciesMarketHeader.skeleton';
import styles from './VacanciesMarketPage.module.css';
import { VacanciesMarketSummarySkeleton } from './VacanciesMarketSummary/VacanciesMarketSummary.skeleton';
import { VacancyMarketCardSkeleton } from './VacancyMarketCard/VacancyMarketCard.skeleton';

export const VacanciesMarketPageSkeleton = () => {
	return (
		<Flex componentType="section" direction="column" gap="24" className={styles.container}>
			<VacanciesMarketHeaderSkeleton />
			<VacanciesMarketSummarySkeleton />

			<div className={styles.grid}>
				{Array.from({ length: 4 }).map((_, index) => (
					<VacancyMarketCardSkeleton key={index} />
				))}
			</div>
		</Flex>
	);
};
