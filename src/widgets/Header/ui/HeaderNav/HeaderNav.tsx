import { getLocale, getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config';

import { HEADER_NAV_LINKS, POPOVER_COLUMNS } from '../../model/constants/headerConstants';
import styles from './HeaderNav.module.css';
import { HeaderNavDesktop } from './HeaderNavDesktop/HeaderNavDesktop';
import { HeaderNavMobile } from './HeaderNavMobile/HeaderNavMobile';

export const HeaderNav = async () => {
	const locale = await getLocale();
	const t = await getTranslations(i18Namespace.header);

	const items = HEADER_NAV_LINKS.map((link) => ({
		id: link.id,
		label: link.label,
		href: link.path,
		path: link.path,
		columns: POPOVER_COLUMNS.map((column) => ({
			id: column.id,
			title: column.title,
			subitems: column.subitems.map((childItem) => ({
				name: t(childItem.title, { default: childItem.title }),
				href: childItem.link === '/' ? `/${locale}` : `/${locale}${childItem.link}`,
				path: childItem.path,
				icon: childItem.icon,
			})),
		})),
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
