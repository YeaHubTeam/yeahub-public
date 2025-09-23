'use client';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';

import styles from './HeaderNavMobile.module.css';

type NavItem = { href: string; path?: string; label: string };

export const HeaderNavMobile = ({ items }: { items: NavItem[] }) => {
	const menuItems: PopoverMenuItem[] = items.map(({ href, label }) => ({
		renderComponent: (onToggle) => (
			<Flex onClick={onToggle}>
				<Link href={href} className={styles.link}>
					{label}
				</Link>
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
					variant="link-gray"
					className={styles.button}
					onClick={onToggle}
				>
					{/* Заголовок берите из переводов на сервере и передавайте через props при желании */}
					Menu
				</Button>
			)}
		</Popover>
	);
};
