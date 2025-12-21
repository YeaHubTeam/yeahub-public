'use client';

import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Avos, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { avosAndYeahubLogo } from '../../model/assets';
import styles from './AvosBanner.module.css';

export const AvosBanner = () => {
	const t = useTranslations(i18Namespace.avos);

	return (
		<Flex direction="column" className={styles['avos-banner']}>
			<Flex justify="between" className={classNames(styles.content, styles['flex-wrapper'])}>
				<div className={styles.promo}>
					<Text variant="body3" color="black-50">
						<Text variant="body3" color="black-50" className={styles['mobile-text']}>
							{t(Avos.AVOS_SUBTITLE)}
						</Text>
						{t(Avos.AVOS_INTERVIEWS)}
					</Text>
					<Text variant={'head3'} color="black-50" isMainTitle className={styles.title}>
						{t(Avos.AVOS_TITLE)}
					</Text>
				</div>
				<Image
					src={avosAndYeahubLogo}
					alt="Avos and Yeahub logo"
					className={styles.logo}
					loading="lazy"
				/>
			</Flex>
		</Flex>
	);
};
