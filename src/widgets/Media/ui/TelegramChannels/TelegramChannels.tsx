import { useTranslations } from 'next-intl';

import { MediaLinksList } from '@/entities/socialMedia';
import { Media, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './TelegramChannels.module.css';

export const TelegramChannels = () => {
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex direction="column" gap="12">
			<Text variant="head3">{t(Media.CHANNELS_TITLE)}</Text>
			<Text variant="body3" className={styles['description']}>
				{t(Media.CHANNELS_DESCRIPTION)}
			</Text>
			<MediaLinksList />
		</Flex>
	);
};
