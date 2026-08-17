import type { GetVacanciesMarketOverviewResponse } from '@/entities/vacancyMarket';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { VacanciesMarketHeader } from './VacanciesMarketHeader/VacanciesMarketHeader';
import styles from './VacanciesMarketPage.module.css';
import { VacanciesMarketSummary } from './VacanciesMarketSummary/VacanciesMarketSummary';
import { VacancyMarketCard } from './VacancyMarketCard/VacancyMarketCard';

interface VacanciesMarketPageProps {
	overview: GetVacanciesMarketOverviewResponse;
}

export const VacanciesMarketPage = ({ overview }: VacanciesMarketPageProps) => {
	const totalAnalyzedVacancies = overview.specializations.reduce(
		(total, specialization) => total + specialization.analyzedVacancyCount,
		0,
	);

	return (
		<Flex componentType="section" direction="column" gap="24" className={styles.container}>
			<VacanciesMarketHeader updatedAt={overview.updatedAt} />

			<VacanciesMarketSummary total={totalAnalyzedVacancies} />

			{overview.specializations.length === 0 ? (
				<Stub type="empty" />
			) : (
				<div className={styles.grid}>
					{overview.specializations.map((specialization) => (
						<VacancyMarketCard
							key={specialization.specializationId}
							specialization={specialization}
						/>
					))}
				</div>
			)}
		</Flex>
	);
};
