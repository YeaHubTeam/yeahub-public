import React from 'react';

import { getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config/i18n/i18n';
import { Footer } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './FooterMain.module.css';

export const FooterMain = async () => {
	const t = await getTranslations(i18Namespace.footer);

	return (
		<Flex dataTestId="FooterMain" className={styles['footer-main']}>
			<Icon
				dataTestId="FooterMain_Logo"
				className={styles['footer-logo']}
				icon="logoText"
				aria-label={t(Footer.HOME_LINKS_LINK_ARIA)}
				color="white-900"
			/>
			<Text
				dataTestId="FooterMain_Title"
				className={styles['footer-title']}
				variant="body3-accent"
				color="white-900"
			>
				{t(Footer.HOME_TITLE)}
			</Text>
			<Text
				dataTestId="FooterMain_Description"
				className={styles['footer-description']}
				variant="body1-accent"
				color="black-400"
			>
				{t(Footer.HOME_DESCRIPTION)}
			</Text>
		</Flex>
	);
};
