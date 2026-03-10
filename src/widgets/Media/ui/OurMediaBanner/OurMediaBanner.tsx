import Image from 'next/image';

import { useTranslations } from 'next-intl';

import Books from '@/shared/assets/images/booksImg.png';
import { Media, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './OurMediaBanner.module.css';

export const OurMediaBanner = () => {
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex className={styles['intro']} justify="between" align="center">
			<Flex direction="column" gap="12" justify="center" className={styles['intro-text-wrapper']}>
				<Text variant="head3" isMainTitle>
					{t(Media.INTRODUCTION_TITLE)}
				</Text>
				<Text variant="body3" className={styles['intro-description']}>
					{t(Media.INTRODUCTION_DESCRIPTION)}
				</Text>
			</Flex>
			<Image src={Books} className={styles['books-img']} alt="" />
		</Flex>
	);
};
