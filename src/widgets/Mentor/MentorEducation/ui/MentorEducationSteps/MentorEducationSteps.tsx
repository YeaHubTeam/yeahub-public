import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { EDUCATION_STEPS } from '../../model/constants/mentorConstants';
import { MentorEducationStep } from '../MentorEducationStep/MentorEducationStep';
import styles from './MentorEducationSteps.module.css';

export const MentorEducationSteps = () => {
	const t = useTranslations(i18Namespace.mentor);
	const steps = t.raw(Mentor.EDUCATION_STEPS) as Array<{ title: string; description: string }>;
	return (
		<div className={styles.wrapper}>
			<Text className={styles.title} variant="head2" color="black-900">
				{t(Mentor.EDUCATION_SUBTITLE)}
			</Text>
			<Flex direction="column" gap="20">
				{EDUCATION_STEPS.map((step, index) => (
					<MentorEducationStep
						key={step.id}
						id={step.id}
						title={steps[index].title}
						description={steps[index].description}
						image={step.image}
						mediaClassName={styles[`media${step.id}`]}
					/>
				))}
			</Flex>
		</div>
	);
};
