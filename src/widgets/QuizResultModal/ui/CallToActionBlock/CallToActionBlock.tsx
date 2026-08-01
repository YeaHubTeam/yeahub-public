import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { SELECT_TARIFF_SETTINGS_TAB } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { bars } from '../../model/assets';
import { AboutBenefits } from '../CallToActionBlock/AboutBenefits/AboutBenefits';
import styles from './CallToActionBlock.module.css';

export const CallToActionBlock = () => {
	const t = useTranslations(i18Namespace.interviewQuizResult);

	const onMoveSelectSubscription = () => {
		window.open(SELECT_TARIFF_SETTINGS_TAB, '_blank', 'noopener,noreferrer');
	};

	return (
		<Flex direction="column">
			<Image className={styles.image} src={bars} alt="bars" />
			<Text variant="body5-strong" className={styles.title}>
				{t(InterviewQuizResult.MODAL_TITLE)}
			</Text>
			<AboutBenefits />
			<Button onClick={onMoveSelectSubscription} size="large" fullWidth className={styles.button}>
				{t(InterviewQuizResult.MODAL_BUTTON_TEXT)}
			</Button>
			<Text variant="body3-accent" color="black-600" className={styles.trial}>
				{t(InterviewQuizResult.MODAL_BUTTON_TIP)}
			</Text>
		</Flex>
	);
};
