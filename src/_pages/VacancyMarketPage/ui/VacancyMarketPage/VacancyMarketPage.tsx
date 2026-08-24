import { getTranslations } from 'next-intl/server';

import { VacancyMarketSpecializationById } from '@/entities/vacancyMarket';
import { Vacancies, i18Namespace } from '@/shared/config';
import { formatUpdatedAt } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';

import { VacancyMarketBody } from '../VacancyMarketBody/VacancyMarketBody';
import { VacancyMarketHeader } from '../VacancyMarketHeader/VacancyMarketHeader';
import { VacancyMarketSummary } from '../VacancyMarketSummary/VacancyMarketSummary';
import styles from './VacancyMarketPage.module.css';

interface VacancyMarketPageProps {
	vacancy: VacancyMarketSpecializationById;
}

export const VacancyMarketPage = async ({ vacancy }: VacancyMarketPageProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<Flex componentType="section" direction="column" gap="24" className={styles.container}>
			<VacancyMarketHeader
				title={t(Vacancies.VACANCY_PROFILE_TITLE)}
				vacancyName={vacancy.name}
				description={t(Vacancies.VACANCY_PROFILE_DESCRIPTION)}
				updatedAtText={t(Vacancies.VACANCY_PROFILE_UPDATED_AT, {
					date: formatUpdatedAt(vacancy.updatedAt),
				})}
			/>

			<VacancyMarketSummary
				title={t(Vacancies.VACANCY_PROFILE_ANALYZED_VACANCIES)}
				total={vacancy.analyzedVacancyCount}
				note={t(Vacancies.VACANCY_PROFILE_DAILY_UPDATE)}
			/>

			<VacancyMarketBody
				topKeywords={vacancy.topKeywords}
				titleSkills={t(Vacancies.VACANCY_PROFILE_TOP_SKILLS)}
				titleTasks={t(Vacancies.VACANCY_PROFILE_FREQUENT_TASKS)}
				topSkills={vacancy.topSkills}
				topTasks={vacancy.topTasks}
				show={t(Vacancies.VACANCY_PROFILE_SHOW_ALL)}
				hide={t(Vacancies.VACANCY_PROFILE_HIDE)}
				softTitle={t(Vacancies.VACANCY_PROFILE_PRIORITY)}
				priority={vacancy.priority}
				titleKeywords={t(Vacancies.KEYWORDS_TITLE)}
			/>
		</Flex>
	);
};
