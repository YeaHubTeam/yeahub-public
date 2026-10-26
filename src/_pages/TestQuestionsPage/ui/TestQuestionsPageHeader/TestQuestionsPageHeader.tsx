import React from 'react';

import { useTranslations } from 'next-intl';

import { GetSkillsListResponse } from '@/entities/skill';
import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { TestQuestions, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './TestQuestionsPageHeader.module.css';

interface TestQuestionsPageHeaderProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
	currentSpecialization: Specialization;
}

export const TestQuestionsPageHeader = ({
	currentSpecialization,
}: TestQuestionsPageHeaderProps) => {
	const t = useTranslations(i18Namespace.testQuestions);

	const title = t(TestQuestions.QUESTIONS_TITLE, {
		specialization: currentSpecialization.title,
	});

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
