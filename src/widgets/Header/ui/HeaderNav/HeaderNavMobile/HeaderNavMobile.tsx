'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Header, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';

import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';
import type { NavItem } from '../types/headerNavTypes';
import styles from './HeaderNavMobile.module.css';

export const HeaderNavMobile = ({ items }: { items: NavItem[] }) => {
	const t = useTranslations(i18Namespace.header);
	const pathname = usePathname();

	const menuItems: PopoverMenuItem[] = items.map(({ href, label, path }) => ({
		renderComponent: (onToggle) => (
			<Flex onClick={onToggle}>
				<HeaderNavLink key={href} link={href} path={path} isActive={pathname?.includes(href)}>
					{label}
				</HeaderNavLink>
			</Flex>
		),
	}));

	return (
		<Popover menuItems={menuItems} className={styles['header-popover']}>
			{({ onToggle, isOpen }) => (
				<Button
					dataTestId="PopoverButton"
					suffix={
						<Icon
							dataTestId="ArrowShortDown_Icon"
							icon="arrowShortDown"
							size={24}
							className={`${styles.arrow} ${isOpen ? styles['arrow-open'] : ''}`}
						/>
					}
					variant="tertiary-link"
					className={styles.button}
					onClick={onToggle}
				>
					{t(Header.MENU)}
				</Button>
			)}
		</Popover>
	);
};
