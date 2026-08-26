import Image from 'next/image';
import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Mentor, ROUTES, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { videoImage, youtubeImage } from '../assets';
import styles from './AboutVideo.module.css';

export const AboutVideo = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Card>
			<Flex direction="column" gap="10">
				<Link
					href={ROUTES.mentor.youtubeVideo}
					className={styles.video}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						src={videoImage}
						alt={t(Mentor.ABOUT_VIDEO_TITLE)}
						className={styles['video-image']}
						fill
					/>
					<div className={styles['play-icon']}>
						<span />
					</div>
				</Link>
				<Flex direction="column" gap="10" className={styles.content}>
					<Text variant="body5-accent">{t(Mentor.ABOUT_VIDEO_TITLE)}</Text>
					<Link
						href={ROUTES.mentor.youtubeVideo}
						className={styles['youtube-link']}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							src={youtubeImage}
							alt={t(Mentor.COMMUNITY_CARD_YOUTUBE_TITLE)}
							className={styles['youtube-image']}
						/>
						<Text variant="body3-strong" color="purple-700">
							{t(Mentor.ABOUT_VIDEO_LINK)}
						</Text>
						<Icon icon="arrowRight" size={24} color="purple-700" className={styles.icon} />
					</Link>
				</Flex>
			</Flex>
		</Card>
	);
};
