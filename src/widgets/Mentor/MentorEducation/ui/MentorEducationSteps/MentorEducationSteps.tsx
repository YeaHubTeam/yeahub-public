import { MentorEducationStep } from '@/entities/mentor';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { MENTOR_STEPS } from '../../model/constants/mentorConstants';
import styles from './MentorEducationSteps.module.css';

export const MentorEducationSteps = () => {
	return (
		<div className={styles.wrapper}>
			<Text variant="head2-accent" color="black-1100">
				Путь к офферу
			</Text>
			<Flex direction="column" gap="20">
				{MENTOR_STEPS.map((step) => (
					<MentorEducationStep
						key={step.id}
						id={step.id}
						title={step.title}
						description={step.description}
						image={step.image}
						mediaClassName={styles[`media${step.id}`]}
					/>
				))}
			</Flex>
		</div>
	);
};
