import React from 'react';

import { useTranslations } from 'next-intl';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Questions as QuestionsTranslations, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { QuestionsFilterPanel } from '../QuestionsFilterPanel/QuestionsFilterPanel';
import styles from './QuestionsPageHeader.module.css';

interface QuestionsPageHeaderProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const QuestionsPageHeader = ({
	initialSpecializations,
	initialSkills,
	currentSpecialization,
}: QuestionsPageHeaderProps) => {
	const t = useTranslations(i18Namespace.questions);

	const title = t(QuestionsTranslations.QUESTIONS_TITLE, {
		specialization: currentSpecialization.title,
	});

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
				<FiltersDrawer>
					<QuestionsFilterPanel
						initialSpecializations={initialSpecializations}
						initialSkills={initialSkills}
						currentSpecialization={currentSpecialization}
					/>
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
