'use client';

import { usePathname } from 'next/navigation';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Header, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';
import { INVERTED_THEME_URLS } from '@/widgets/Header/model/constants/headerConstants';
import { NavMenuPopover } from '@/widgets/Header/ui/HeaderNav/NavMenuPopover/NavMenuPopover';

import { NavLink } from '../../../model/types/headerTypes';
import styles from './HeaderNavMobile.module.css';

interface HeaderNavMobileProps {
	items: NavLink[];
}

export const HeaderNavMobile = ({ items }: HeaderNavMobileProps) => {
	const t = useTranslations(i18Namespace.header);
	const pathname = usePathname();

	const isInverted = INVERTED_THEME_URLS.some((url) => pathname.slice(3) === url);
	const activeNavLink = items.find((item) =>
		item.subitems?.some((column) => pathname.includes(column.path)),
	);

	const popoverMenuItems: PopoverMenuItem[] = [
		{
			renderComponent: (onToggle: () => void) => (
				<NavMenuPopover
					columns={items}
					isInverted={isInverted}
					onItemClick={() => {
						onToggle();
					}}
				/>
			),
		},
	];

	return (
		<Popover menuItems={popoverMenuItems} className={styles['header-popover']}>
			{({ onToggle, isOpen }) => (
				<Button
					suffix={
						<Icon
							icon="arrowShortDown"
							size={24}
							className={classNames(styles.arrow, { [styles['arrow-open']]: isOpen })}
						/>
					}
					variant="tertiary-link"
					className={classNames(styles.button, { [styles.inverted]: isInverted })}
					onClick={onToggle}
				>
					{activeNavLink?.title || t(Header.MENU)}
				</Button>
			)}
		</Popover>
	);
};
