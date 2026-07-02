import { useTranslations } from 'next-intl';

import { Collection } from '@/entities/collection';
import { VacancyDetails } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsSection } from '@/widgets/Specialization/CollectionsSection';
import { TasksSection } from '@/widgets/Specialization/TasksSection';
import { VacancyAdditionalInfo } from '@/widgets/Vacancy/VacancyAdditionalInfo';
import { VacancyDescription } from '@/widgets/Vacancy/VacancyDescription';
import { VacancyMainInfo } from '@/widgets/Vacancy/VacancyMainInfo';

import styles from './VacancyPage.module.css';

interface VacancyPageProps {
	locale: string;
	vacancy: VacancyDetails;
	collections: Collection[] | null;
	specializationSlug?: string;
}

export const VacancyPage = ({
	locale,
	vacancy,
	collections,
	specializationSlug,
}: VacancyPageProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<div className={styles.layout}>
			<Flex gap="20" direction="column">
				<Card className={styles.card}>
					<VacancyMainInfo vacancy={vacancy} />
				</Card>
				<Card className={styles.card}>
					<VacancyDescription description={vacancy.description} />
				</Card>

				{vacancy.company.id && vacancy.preparation.collectionsCount > 0 && (
					<CollectionsSection
						collections={collections ?? []}
						specializationSlug={specializationSlug}
						locale="ru"
						companyId={vacancy.company.id}
						title={t(Vacancies.COLLECTIONS_SECTION_TITLE, { company: vacancy.company.title })}
					/>
				)}

				{vacancy.company.id && vacancy.preparation.tasksCount > 0 && (
					<TasksSection
						locale={locale}
						companyId={vacancy.company.id}
						title={t(Vacancies.TASKS_SECTION_TITLE, { company: vacancy.company.title })}
					/>
				)}
			</Flex>

			<div className={styles['sidebar-desktop-only']}>
				<VacancyAdditionalInfo skills={vacancy.skills} aiProfile={vacancy.aiProfile} />
			</div>
		</div>
	);
};
