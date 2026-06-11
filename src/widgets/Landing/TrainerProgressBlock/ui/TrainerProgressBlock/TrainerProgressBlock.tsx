import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { trainer, trainerMobile } from '../../model/assets';
import { statistics } from '../../model/assets';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import styles from './TrainerProgressBlock.module.css';

export const TrainerProgressBlock = () => {
	const t = useTranslations(i18Namespace.landing);
	return (
		<section className={styles['trainer-progress']}>
			<div className={styles['title-block']}>
				<Text variant="head3" className={styles.title}>
					{t(Landing.TRAINER_PROGRESS_TITLE).toUpperCase()}
				</Text>
				<Text variant="body3" className={styles.subtitle}>
					{t(Landing.TRAINER_PROGRESS_SUBTITLE)}
				</Text>
			</div>
			<Flex gap="20" className={styles['trainer-progress-wrapper']}>
				<InfoBlock
					image={trainer}
					imageMobile={trainerMobile}
					title={t(Landing.TRAINER_PROGRESS_BLOCK_FIRST_TITLE)}
					text={t(Landing.TRAINER_PROGRESS_BLOCK_FIRST_DESCRIPTION)}
					linkText={t(Landing.TRAINER_PROGRESS_BLOCK_FIRST_LINK)}
				/>
				<InfoBlock
					image={statistics}
					title={t(Landing.TRAINER_PROGRESS_BLOCK_SECOND_TITLE)}
					text={t(Landing.TRAINER_PROGRESS_BLOCK_SECOND_DESCRIPTION)}
					linkText={t(Landing.TRAINER_PROGRESS_BLOCK_SECOND_LINK)}
				/>
			</Flex>
		</section>
	);
};
