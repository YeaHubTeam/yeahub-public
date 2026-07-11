import { useTranslations } from 'next-intl';

import { Collection } from '@/entities/collection';
import { Vacancy } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { BackButton } from '@/shared/ui/BackButton';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsSection } from '@/widgets/Specialization/CollectionsSection';
import { TasksSection } from '@/widgets/Specialization/TasksSection';

import { VacancyAdditionalInfo } from '../VacancyAdditionalInfo/VacancyAdditionalInfo';
import { VacancyDescription } from '../VacancyDescription/VacancyDescription';
import { VacancyMainInfo } from '../VacancyMainInfo/VacancyMainInfo';
import styles from './VacancyPage.module.css';

interface VacancyPageProps {
	locale: string;
	vacancy: Vacancy;
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
		<Flex direction="column" align="start">
			<Flex>
				<BackButton />
			</Flex>
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1}>
					<Card className={styles.card}>
						<VacancyMainInfo vacancy={vacancy} />
					</Card>
					<Card className={styles.card}>
						<VacancyDescription description={vacancy.description} />
					</Card>
					<div className={styles.ai}>
						<VacancyAdditionalInfo skills={vacancy.skills} aiProfile={vacancy.aiProfile} />
					</div>
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

				{vacancy.aiProfile && (
					<div className={styles.additional}>
						<VacancyAdditionalInfo skills={vacancy.skills} aiProfile={vacancy.aiProfile} />
					</div>
				)}
			</Flex>
		</Flex>
	);
};
