import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { company, personImg, progress, statistics } from '../../model/assets';
import { Sticker } from '../Sticker/Sticker';
import styles from './BannerImage.module.css';

export const BannerImage = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<div className={styles['img-block']}>
			<Flex justify="center" align="end" className={styles['img-wrapper']}>
				<Image
					className={styles.wallpaper}
					src={personImg}
					alt={t(Landing.BANNER_IMG_HOMEPAGE)}
					fetchPriority="high"
				/>
				<Image
					className={styles.statistics}
					src={statistics}
					alt={t(Landing.BANNER_IMG_STATISTICS)}
					fetchPriority="high"
				/>
				<Image
					className={styles.company}
					src={company}
					alt={t(Landing.BANNER_IMG_COMPANY)}
					fetchPriority="high"
				/>
				<Image
					className={styles.progress}
					src={progress}
					alt={t(Landing.BANNER_IMG_PROGRESS)}
					fetchPriority="high"
				/>
				<Sticker
					text={t(Landing.BANNER_STICKER_CANDIDATE)}
					className={styles['sticker-candidate']}
				/>
			</Flex>
		</div>
	);
};
