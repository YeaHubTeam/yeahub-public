import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { quizImage } from '../../model/assets';
import { AdditionalBlock } from '../AdditionalBlock/AdditionalBlock';
import { MainBlock } from '../MainBlock/MainBlock';
import styles from './InterviewTrainerBlock.module.css';

export const InterviewTrainerBlock = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<section className={styles['interview-trainer']}>
			<div className={styles['title-block']}>
				<Text variant="head2" className={styles.title}>
					{t(Landing.TRAINING_INTERVIEW_TITLE).toUpperCase()}
				</Text>
				<Text variant="body3" className={styles.subtitle}>
					{t(Landing.TRAINING_INTERVIEW_SUBTITLE)}
				</Text>
			</div>
			<Flex className={styles['interview-trainer-wrapper']} align="center">
				<MainBlock questionImg={quizImage} text={t(Landing.TRAINING_INTERVIEW_SUBTITLE_TABLET)} />
				<AdditionalBlock
					textFirst={t(Landing.TRAINING_INTERVIEW_ADVANTAGES_FIRST)}
					textSecond={t(Landing.TRAINING_INTERVIEW_ADVANTAGES_SECOND)}
				/>
			</Flex>
		</section>
	);
};
