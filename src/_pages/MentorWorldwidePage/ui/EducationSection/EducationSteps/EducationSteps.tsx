import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { MentorWorldwide } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { EducationStep } from '../EducationStep/EducationStep';
import { EDUCATION_STEPS } from '../constants/mentorConstants';
import styles from './EducationSteps.module.css';

export const EducationSteps = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<div className={styles.wrapper}>
			<Text className={styles.title} variant="head2">
				{t(MentorWorldwide.EDUCATION_SUBTITLE)}
			</Text>
			<Flex direction="column" className={styles.list}>
				{EDUCATION_STEPS.map((step) => (
					<EducationStep
						key={step.id}
						id={step.id}
						title={t(step.title)}
						description={t(step.description)}
						image={step.image}
						imgAlt={step?.imgAlt ? t(step.imgAlt) : ''}
						mediaClassName={styles[`media${step.id}`]}
					/>
				))}
			</Flex>
		</div>
	);
};
