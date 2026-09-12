import { getTranslations } from 'next-intl/server';

import type { VacancyMarketSpecialization } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import { VacancyMarketCardHeader } from '../VacancyMarketCardHeader/VacancyMarketCardHeader';
import { VacancyMarketKeywords } from '../VacancyMarketKeywords/VacancyMarketKeywords';
import { VacancyMarketSkills } from '../VacancyMarketSkills/VacancyMarketSkills';
import styles from './VacancyMarketCard.module.css';

interface VacancyMarketCardProps {
	specialization: VacancyMarketSpecialization;
}

export const VacancyMarketCard = async ({ specialization }: VacancyMarketCardProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	const hasTopSkills = specialization.topSkills.length > 0;
	const hasTopKeywords = specialization.topKeywords.length > 0;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			titleComponent={
				<VacancyMarketCardHeader
					name={specialization.name}
					vacanciesCountText={t(Vacancies.MARKET_PAGE_VACANCY_COUNT, {
						count: specialization.vacancyCount,
					})}
				/>
			}
			actionRoute={`/vacancies-market/${specialization.specializationId}`}
			actionTitle={t(Vacancies.MARKET_PAGE_DETAILED_PROFILE)}
			isActionPositionBottom
		>
			{(hasTopSkills || hasTopKeywords) && (
				<div className={styles.sections}>
					{hasTopSkills && (
						<VacancyMarketSkills
							skills={specialization.topSkills}
							title={t(Vacancies.MARKET_PAGE_TOP_SKILLS)}
						/>
					)}
					{hasTopKeywords && (
						<VacancyMarketKeywords
							keywords={specialization.topKeywords}
							title={t(Vacancies.KEYWORDS_TITLE)}
						/>
					)}
				</div>
			)}
		</Card>
	);
};
