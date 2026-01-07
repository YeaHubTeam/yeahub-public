import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { AvatarGroup } from '../AvatarGroup/AvatarGroup';
import { BannerButton } from '../BannerButton/BannerButton';
import { BlockDescription } from '../BlockDescription/BlockDescription';
import { BlockTitle } from '../BlockTitle/BlockTitle';
import { Sticker } from '../Sticker/Sticker';
import styles from './BannerContent.module.css';

export const BannerContent = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex direction="column" justify="between" className={styles['content-block']}>
			<Sticker text={t(Landing.BANNER_STICKER_SKILL)} className={styles['sticker-skill']} />
			<Flex gap="6" direction="column" className={styles['content-wrapper']}>
				<AvatarGroup />
				<BlockTitle />
				<BlockDescription />
				<BannerButton />
			</Flex>
		</Flex>
	);
};
