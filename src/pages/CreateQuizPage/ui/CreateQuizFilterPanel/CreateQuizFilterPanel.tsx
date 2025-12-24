'use client';

import { ChooseQuestionComplexity, ChooseQuestionCount } from '@/entities/question';
import { QuizQuestionMode } from '@/entities/quiz';
import { SkillsListField } from '@/entities/skill';
import { SpecializationsListField } from '@/entities/specialization';
import { MAX_CHOOSE_QUESTION_COUNT } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';

import { useCreateQuizFilter } from '../../model/api/useCreateQuizFilter';
import styles from './CreateQuizFilterPanel.module.css';

export const CreateQuizFilterPanel = () => {
	const { filter, selectedSpecialization, handlers } = useCreateQuizFilter();

	return (
		<Flex justify="between" className={styles.wrapper}>
			<Flex className={styles['skills-selection']} direction="column">
				<SpecializationsListField
					selectedSpecialization={selectedSpecialization}
					onChangeSpecialization={handlers.onChangeSpecialization}
				/>
				<SkillsListField
					selectedSkills={filter.skills}
					onChangeSkills={handlers.onChangeSkills}
					selectedSpecialization={selectedSpecialization}
				/>
			</Flex>
			<Flex direction="column" gap="24" className={styles['additional-wrapper']}>
				<ChooseQuestionComplexity
					onChangeComplexity={handlers.onChangeComplexity}
					selectedComplexity={filter.complexity}
				/>
				<QuizQuestionMode disabled={true} />
				<ChooseQuestionCount
					onChangeCount={handlers.onChangeLimit}
					count={filter.limit || 1}
					maxCount={MAX_CHOOSE_QUESTION_COUNT}
				/>
			</Flex>
		</Flex>
	);
};
