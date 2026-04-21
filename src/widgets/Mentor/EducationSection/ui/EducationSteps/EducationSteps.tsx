import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Mentor } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { EDUCATION_STEPS } from '../../model/constants/mentorConstants';
import { EducationStep } from '../EducationStep/EducationStep';
import styles from './EducationSteps.module.css';

export const EducationSteps = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<div className={styles.wrapper}>
			<Text className={styles.title} variant="head2">
				{t(Mentor.EDUCATION_SUBTITLE)}
			</Text>
			<Flex direction="column" gap="20">
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
