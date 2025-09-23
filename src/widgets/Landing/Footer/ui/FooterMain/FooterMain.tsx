import React from 'react';

import { getTranslations } from 'next-intl/server';

import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './FooterMain.module.css';

export const FooterMain = async () => {
	const t = await getTranslations('landing.footer');

	return (
		<Flex dataTestId="FooterMain" className={styles['footer-main']}>
			<Icon
				dataTestId="FooterMain_Logo"
				className={styles['footer-logo']}
				icon="logoText"
				aria-label={t('links.link.aria-label')}
				color="white-900"
			/>
			<Text
				dataTestId="FooterMain_Title"
				className={styles['footer-title']}
				variant="body3-accent"
				color="white-900"
			>
				{t('title')}
			</Text>
			<Text
				dataTestId="FooterMain_Description"
				className={styles['footer-description']}
				variant="body1-accent"
				color="black-400"
			>
				{t('description')}
			</Text>
		</Flex>
	);
};
