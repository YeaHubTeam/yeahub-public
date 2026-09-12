import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { trainerMobile } from '../../model/assets';
import { statistics } from '../../model/assets';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import styles from './TrainerProgressSection.module.css';

export const TrainerProgressSection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<SectionWrapper
			title={t(Landing.TRAINER_PROGRESS_TITLE).toUpperCase()}
			subtitle={t(Landing.TRAINER_PROGRESS_SUBTITLE)}
		>
			<Flex gap="20" className={styles.list}>
				<InfoBlock
					image={trainerMobile}
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
		</SectionWrapper>
	);
};
