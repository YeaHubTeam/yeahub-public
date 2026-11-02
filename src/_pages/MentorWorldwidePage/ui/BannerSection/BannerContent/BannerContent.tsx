import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BannerButton } from '../BannerButton/BannerButton';
import { BannerDescription } from '../BannerDescription/BannerDescription';
import { BannerSticker } from '../BannerSticker/BannerSticker';
import { BannerTitle } from '../BannerTitle/BannerTitle';
import styles from './BannerContent.module.css';

export const BannerContent = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<Flex direction="column" align="center" gap="20" className={styles.content}>
			<BannerSticker text={t(MentorWorldwide.BANNER_STICKER)} />
			<Flex direction="column" align="center" gap="24" className={styles.column}>
				<Flex direction="column" align="center" gap="10" className={styles.text}>
					<BannerTitle />
					<BannerDescription />
				</Flex>
				<BannerButton />
			</Flex>
		</Flex>
	);
};
