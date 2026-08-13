import { getTranslations } from 'next-intl/server';

import type { GetVacanciesMarketOverviewResponse } from '@/entities/vacancyMarket';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { formatUpdatedAt } from '../lib/formatUpdatedAt';
import { VacanciesMarketHeader } from './VacanciesMarketHeader/VacanciesMarketHeader';
import styles from './VacanciesMarketPage.module.css';
import { VacanciesMarketSummary } from './VacanciesMarketSummary/VacanciesMarketSummary';
import { VacancyMarketCard } from './VacancyMarketCard/VacancyMarketCard';

interface VacanciesMarketPageProps {
	overview: GetVacanciesMarketOverviewResponse;
}

export const VacanciesMarketPage = async ({ overview }: VacanciesMarketPageProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	const totalAnalyzedVacancies = overview.specializations.reduce(
		(total, specialization) => total + specialization.analyzedVacancyCount,
		0,
	);

	return (
		<Flex componentType="section" direction="column" gap="24" className={styles.container}>
			<VacanciesMarketHeader
				title={t(Vacancies.MARKET_PAGE_TITLE)}
				description={t(Vacancies.MARKET_PAGE_DESCRIPTION)}
				updatedAtText={t(Vacancies.MARKET_PAGE_UPDATED_AT, {
					date: formatUpdatedAt(overview.updatedAt),
				})}
			/>

			<VacanciesMarketSummary
				title={t(Vacancies.MARKET_PAGE_TOTAL_ANALYZED)}
				total={totalAnalyzedVacancies}
				note={t(Vacancies.MARKET_PAGE_DAILY_UPDATE)}
			/>

			{overview.specializations.length === 0 ? (
				<Stub type="empty" />
			) : (
				<div className={styles.grid}>
					{overview.specializations.map((specialization) => (
						<VacancyMarketCard
							key={specialization.specializationId}
							specialization={specialization}
							vacanciesCountText={t(Vacancies.MARKET_PAGE_VACANCY_COUNT, {
								count: specialization.vacancyCount,
							})}
							topSkillsTitle={t(Vacancies.MARKET_PAGE_TOP_SKILLS)}
							topKeywordsTitle={t(Vacancies.KEYWORDS_TITLE)}
							detailedProfileText={t(Vacancies.MARKET_PAGE_DETAILED_PROFILE)}
						/>
					))}
				</div>
			)}
		</Flex>
	);
};
