import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import classNames from 'classnames';
import { getLocale, getTranslations } from 'next-intl/server';

import logoDark from '@/shared/assets/icons/logoDark.avif';
import logoLight from '@/shared/assets/icons/logoLight.avif';
import LogoText from '@/shared/assets/icons/logoText.svg';

import styles from './AppLogo.module.css';

export interface AppLogoProps {
	href?: string;
	logoType?: 'light' | 'dark';
	fill?: 'white' | 'black';
	isOpen?: boolean;
	navigationFooter?: boolean;
	disabled?: boolean;
}

export const AppLogo = async ({
	href = '/',
	logoType = 'dark',
	fill = 'black',
	isOpen = false,
	navigationFooter = false,
	disabled = false,
}: AppLogoProps) => {
	const locale = await getLocale();
	const t = await getTranslations('landing.header');

	const targetHref = disabled ? '#' : href === '/' ? `/${locale}` : `/${locale}${href}`;

	const logoSrc = logoType === 'dark' ? logoDark : logoLight;

	const content = (
		<>
			{!navigationFooter && (
				<Image
					className={styles.logo}
					src={logoSrc}
					alt={t('logoAlt', { default: 'Yeahub logo' })}
					width={33}
					height={33}
					unoptimized
					priority
				/>
			)}
			{(!isOpen || navigationFooter) && (
				<LogoText
					className={classNames(
						styles['logo-text'],
						{ [styles['logo-text-header']]: !navigationFooter },
						styles[fill],
					)}
				/>
			)}
		</>
	);

	if (disabled) {
		return (
			<div
				data-testid="AppLogo_Link"
				className={classNames(
					styles['home-link'],
					{ [styles.center]: isOpen },
					styles['pointer-event-none'],
				)}
			>
				{content}
			</div>
		);
	}

	return (
		<Link
			data-testid="AppLogo_Link"
			href={targetHref}
			className={classNames(styles['home-link'], { [styles.center]: isOpen })}
		>
			{content}
		</Link>
	);
};
