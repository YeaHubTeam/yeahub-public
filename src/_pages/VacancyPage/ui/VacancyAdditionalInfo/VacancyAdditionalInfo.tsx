import { useTranslations } from 'next-intl';

import type { Vacancy } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { VacancyKeywords } from '../VacancyKeywords/VacancyKeywords';
import { VacancyPriority } from '../VacancyPriority/VacancyPriority';
import { VacancySkills } from '../VacancySkills/VacancySkills';
import { VacancyTasks } from '../VacancyTasks/VacancyTasks';
import styles from './VacancyAdditionalInfo.module.css';

interface VacancyAdditionalInfoProps {
	skills: Vacancy['skills'];
	aiProfile: Vacancy['aiProfile'];
}

export const VacancyAdditionalInfo = ({ skills, aiProfile }: VacancyAdditionalInfoProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card className={styles.card}>
			<Flex gap="20" direction="column">
				<Flex justify="between">
					<Flex gap="8">
						<Icon icon="starFall" color="purple-700" size={24} />
						<Text variant="body5-accent" color="black-900">
							{t(Vacancies.NEURO_FIELDS_TITLE)}
						</Text>
					</Flex>
					<StatusChip status={{ text: 'AI', variant: 'purple' }} size="medium" />
				</Flex>
				<Flex gap="40" direction="column" className={styles['sidebar-content']}>
					<VacancyTasks tasks={aiProfile.tasks} />
					<VacancySkills skills={skills} />
					<VacancyKeywords keywords={aiProfile.keywords} />
					<VacancyPriority prioritySkills={aiProfile.extra} />
				</Flex>
			</Flex>
		</Card>
	);
};
