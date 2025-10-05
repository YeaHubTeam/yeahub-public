import React from 'react';

import { getLocale, getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config/i18n/i18n';

import { HEADER_NAV_LINKS } from '../../model/constants/headerConstants';
import styles from './HeaderNav.module.css';
import { HeaderNavDesktop } from './HeaderNavDesktop/HeaderNavDesktop';
import { HeaderNavMobile } from './HeaderNavMobile/HeaderNavMobile';

export const HeaderNav = async () => {
	const locale = await getLocale();
	const t = await getTranslations(i18Namespace.header);

	const items = HEADER_NAV_LINKS.map(({ link, path, title }) => ({
		href: link === '/' ? `/${locale}` : `/${locale}${link}`,
		path,
		label: t(title, { default: title }),
	}));

	return (
		<nav data-testid="HeaderNav">
			<div className={styles['nav-desktop']}>
				<HeaderNavDesktop items={items} />
			</div>
			<div className={styles['nav-mobile']}>
				<HeaderNavMobile items={items} />
			</div>
		</nav>
	);
};
