'use client';

import { useState } from 'react';

import { Flex } from '@/shared/ui/Flex';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';

import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';
import { NavMenuPopover } from '../NavMenuPopover/NavMenuPopover';
import type { NavItem } from '../types/headerNavTypes';
import styles from './HeaderNavDesktop.module.css';

interface HeaderNavDesktopProps {
	items: NavItem[];
}

export const HeaderNavDesktop = ({ items }: HeaderNavDesktopProps) => {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [activeNavLink, setActiveNavLink] = useState<string | null>(null);

	const handleMouseEnter = () => {
		setIsPopoverOpen(true);
	};

	const handleMouseLeave = () => {
		setIsPopoverOpen(false);
		setActiveNavLink(null);
	};

	const handlePopoverMouseLeave = () => {
		handleMouseLeave();
	};

	const handleNavLinkHover = (id: string) => {
		setActiveNavLink(id);
	};

	const popoverColumns = items[0]?.columns || [];

	const navItems = items.map((item) => ({
		id: item.id,
		label: item.label,
		href: item.href,
		path: item.path,
	}));

	const popoverMenuItems: PopoverMenuItem[] = [
		{
			renderComponent: (onToggle: () => void) => (
				<div onMouseLeave={handlePopoverMouseLeave}>
					<NavMenuPopover
						columns={popoverColumns}
						onLinkHover={handleNavLinkHover}
						onItemClick={() => {
							onToggle();
							setIsPopoverOpen(false);
						}}
					/>
				</div>
			),
		},
	];

	return (
		<Popover
			isOpen={isPopoverOpen}
			placement="bottom-start"
			menuItems={popoverMenuItems}
			className={styles['nav-popover']}
		>
			<Flex
				dataTestId="HeaderNavDesktop_Wrapper"
				gap="40"
				onMouseEnter={handleMouseEnter}
				className={styles['nav-wrapper']}
			>
				{navItems.map((item) => (
					<HeaderNavLink
						key={item.id}
						link={item.href}
						path={item.path}
						isActive={activeNavLink === item.id}
					>
						{item.label}
					</HeaderNavLink>
				))}
			</Flex>
		</Popover>
	);
};
