import { getLocale, getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config';
import { NavLink } from '@/widgets/Header/model/types/headerTypes';

import { HEADER_NAV_LINKS } from '../../model/constants/headerConstants';
import styles from './HeaderNav.module.css';
import { HeaderNavDesktop } from './HeaderNavDesktop/HeaderNavDesktop';
import { HeaderNavMobile } from './HeaderNavMobile/HeaderNavMobile';

export const HeaderNav = async () => {
	const locale = await getLocale();
	const t = await getTranslations(i18Namespace.header);

	const items: NavLink[] = HEADER_NAV_LINKS.map((link) => ({
		id: link.id,
		title: t(link.title),
		subitems: link.subitems.map((childItem) => ({
			title: t(childItem.title, { default: childItem.title }),
			link: childItem.link === '/' ? `/${locale}` : `/${locale}${childItem.link}`,
			path: childItem.path,
			icon: childItem.icon,
		})),
	}));

	return (
		<nav>
			<div className={styles['nav-desktop']}>
				<HeaderNavDesktop items={items} />
			</div>
			<div className={styles['nav-mobile']}>
				<HeaderNavMobile items={items} />
			</div>
		</nav>
	);
};
