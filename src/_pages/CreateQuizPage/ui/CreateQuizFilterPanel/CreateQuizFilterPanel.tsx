'use client';

import React, { useEffect } from 'react';

import { ChooseQuestionComplexity, ChooseQuestionCount } from '@/entities/question';
import { LS_ACTIVE_MOCK_QUIZ_KEY, QuizQuestionMode } from '@/entities/quiz';
import { GetSkillsListResponse, SkillsListField } from '@/entities/skill';
import {
	GetSpecializationsListResponse,
	SpecializationsListField,
} from '@/entities/specialization';
import { MAX_CHOOSE_QUESTION_COUNT, removeFromLS } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';

import { useCreateQuizFilter } from '../../model/api/useCreateQuizFilter';
import { CreateQuizLink } from '../CreateQuizLink/CreateQuizLink';
import styles from './CreateQuizFilterPanel.module.css';

interface CreateQuizFilterPanelProps {
	initialSpecializations?: GetSpecializationsListResponse | null;
	initialSkills?: GetSkillsListResponse | null;
}

export const CreateQuizFilterPanel = ({
	initialSpecializations,
	initialSkills,
}: CreateQuizFilterPanelProps) => {
	const { filter, selectedSpecialization, handlers } = useCreateQuizFilter();

	useEffect(() => {
		removeFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
	}, []);

	return (
		<>
			<Flex justify="between" className={styles.wrapper}>
				<Flex className={styles['skills-selection']} direction="column">
					<SpecializationsListField
						selectedSpecialization={selectedSpecialization}
						onChangeSpecialization={handlers.onChangeSpecialization}
						initialData={initialSpecializations}
					/>
					<SkillsListField
						selectedSkills={filter.skills}
						onChangeSkills={handlers.onChangeSkills}
						selectedSpecialization={selectedSpecialization}
						initialData={initialSkills}
					/>
				</Flex>
				<Flex direction="column" gap="24" className={styles['additional-wrapper']}>
					<ChooseQuestionComplexity
						onChangeComplexity={handlers.onChangeComplexity}
						selectedComplexity={filter.complexity}
						disabled
					/>
					<QuizQuestionMode disabled />
					<ChooseQuestionCount
						onChangeCount={handlers.onChangeLimit}
						count={filter.limit || 1}
						maxCount={MAX_CHOOSE_QUESTION_COUNT}
					/>
				</Flex>
			</Flex>
			<CreateQuizLink filter={filter} />
		</>
	);
};
