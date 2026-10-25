import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BannerButton } from '../BannerButton/BannerButton';
import { BannerDescription } from '../BannerDescription/BannerDescription';
import { BannerSticker } from '../BannerSticker/BannerSticker';
import { BannerTitle } from '../BannerTitle/BannerTitle';
import styles from './BannerContent.module.css';

export const BannerContent = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<Flex direction="column" align="center" className={styles.content}>
			<BannerSticker text={t(MentorFullstack.BANNER_STICKER)} />
			<Flex direction="column" align="center" className={styles.column}>
				<BannerTitle />
				<BannerDescription />
				<BannerButton />
			</Flex>
		</Flex>
	);
};
