import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import classNames from 'classnames';
import { getLocale, getTranslations } from 'next-intl/server';

import { LogoText } from '@/shared/assets';
import { logoDark } from '@/shared/assets';
import { logoLight } from '@/shared/assets';
import { Header, i18Namespace } from '@/shared/config';

import styles from './AppLogo.module.css';

export interface AppLogoProps {
	logoType?: 'light' | 'dark';
	fill?: 'white' | 'black';
	navigationFooter?: boolean;
	disabled?: boolean;
}

export const AppLogo = async ({
	logoType = 'dark',
	fill = 'black',
	navigationFooter = false,
	disabled = false,
}: AppLogoProps) => {
	const locale = await getLocale();
	const t = await getTranslations(i18Namespace.header);

	const targetHref = disabled ? '#' : `/${locale}`;

	const logoSrc = logoType === 'dark' ? logoDark : logoLight;

	const content = (
		<>
			{!navigationFooter && (
				<>
					<Image
						className={styles.logo}
						src={logoSrc}
						alt={t(Header.LOGO_ALT, { default: 'Yeahub logo' })}
						width={33}
						height={33}
						unoptimized
						priority
					/>
					<LogoText
						className={classNames(
							styles['logo-text'],
							{ [styles['logo-text-header']]: !navigationFooter },
							styles[fill],
						)}
					/>
				</>
			)}
		</>
	);

	if (disabled) {
		return (
			<div
				data-testid="AppLogo_Link"
				className={classNames(
					styles['home-link'],
					{ [styles.center]: navigationFooter },
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
			className={classNames(styles['home-link'], { [styles.center]: navigationFooter })}
		>
			{content}
		</Link>
	);
};
