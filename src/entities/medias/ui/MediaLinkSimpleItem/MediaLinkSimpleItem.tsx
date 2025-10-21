'use client';

import { useTranslations } from 'next-intl';

import { Media, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Icon } from '@/shared/ui/Icon';

import { Media as MediaInterface } from '../../model/types/media';
import styles from './MediaLinkSimpleItem.module.css';

type MediaLinkSimpleItemProps = {
	mediaLink: MediaInterface;
};

export const MediaLinkSimpleItem = ({ mediaLink }: MediaLinkSimpleItemProps) => {
	const t = useTranslations(i18Namespace.media);
	return (
		<Chip
			className={styles.container}
			variant="big"
			label={
				<span className={styles['container-text']}>
					{t(Media.MEDIA_LINK_START)}
					<a href={mediaLink.link} color="purple-700" target="_blank" rel="noopener noreferrer">
						{mediaLink.title}
					</a>
					{t(Media.MEDIA_LINK_END)}
				</span>
			}
			prefix={<Icon icon="telegramWithBackground" color="purple-700" />}
		/>
	);
};
