import { useTranslations } from 'next-intl';

import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './AboutBenefits.module.css';

export const AboutBenefits = () => {
	const t = useTranslations(i18Namespace.interviewQuizResult);

	const benefits = [
		t(InterviewQuizResult.MODAL_BENEFITS_FULL_ACCESS),
		t(InterviewQuizResult.MODAL_BENEFITS_SMART_MODE),
		t(InterviewQuizResult.MODAL_BENEFITS_STATISTICS),
		t(InterviewQuizResult.MODAL_BENEFITS_INTERVIEWS),
	];

	return (
		<Flex direction="column">
			<Text variant="body3-accent" color="black-600">
				{t(InterviewQuizResult.MODAL_DESCRIPTION)}
			</Text>
			<Flex componentType="ul" gap="8" direction="column" className={styles.benefits}>
				{benefits.map((benefit) => {
					return (
						<Flex key={benefit} componentType="li" align="center" gap="8">
							<Icon icon="check" color="purple-700" size={20} />
							{benefit}
						</Flex>
					);
				})}
			</Flex>
		</Flex>
	);
};
