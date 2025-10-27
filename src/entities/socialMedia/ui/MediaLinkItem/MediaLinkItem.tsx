import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { SocialMedia } from '@/entities/socialMedia';
import { Media as MediaTranslation, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MediaLinkItem.module.css';

interface MediaLinkItemProps {
	channel: SocialMedia;
}

export const MediaLinkItem = ({ channel }: MediaLinkItemProps) => {
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex justify="between" className={styles['item']} align="center" componentType="li">
			<Flex gap="12" align="start">
				{channel.image && <div className={styles['svg-wrapper']}>{<channel.image />}</div>}
				<Flex direction="column" gap="6">
					<Text variant="body3-strong">{channel.title}</Text>
					<Text variant="body3">{t(MediaTranslation.TELEGRAM_DESCRIPTION)}</Text>
				</Flex>
			</Flex>

			<Link
				href={channel.link}
				target="_blank"
				rel="noopener noreferrer"
				className={styles['link']}
			>
				<Button variant="outline" className={styles['button']} size="medium">
					<Text variant="body3-strong">{t(MediaTranslation.TELEGRAM_SUBSCRIBE)}</Text>
				</Button>
			</Link>
		</Flex>
	);
};
