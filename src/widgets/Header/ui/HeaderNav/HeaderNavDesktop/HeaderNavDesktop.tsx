'use client';

import { usePathname } from 'next/navigation';

import { useModal } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';

import { INVERTED_THEME_URLS } from '../../../model/constants/headerConstants';
import { NavLink } from '../../../model/types/headerTypes';
import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';
import { NavMenuPopover } from '../NavMenuPopover/NavMenuPopover';
import styles from './HeaderNavDesktop.module.css';

interface HeaderNavDesktopProps {
	items: NavLink[];
}

export const HeaderNavDesktop = ({ items }: HeaderNavDesktopProps) => {
	const { isOpen, onOpen, onClose } = useModal();
	const pathname = usePathname();

	const isInverted = INVERTED_THEME_URLS.some((url) => pathname.slice(3) === url);
	const activeNavLink = items.find((item) =>
		item.subitems?.some((column) => pathname.includes(column.path)),
	);

	const handleMouseEnter = () => {
		onOpen();
	};

	const handleMouseLeave = () => {
		onClose();
	};

	const handlePopoverMouseLeave = () => {
		handleMouseLeave();
	};

	const popoverMenuItems: PopoverMenuItem[] = [
		{
			renderComponent: (onToggle: () => void) => (
				<div onMouseLeave={handlePopoverMouseLeave}>
					<NavMenuPopover
						columns={items}
						isInverted={isInverted}
						onItemClick={() => {
							onToggle();
							onClose();
						}}
					/>
				</div>
			),
		},
	];

	return (
		<Popover
			isOpen={isOpen}
			placement="bottom-start"
			menuItems={popoverMenuItems}
			className={styles['nav-popover']}
		>
			<Flex gap="40" onMouseEnter={handleMouseEnter} className={styles['nav-wrapper']}>
				{items.map((item) => (
					<HeaderNavLink
						key={item.id}
						isActive={activeNavLink?.id === item.id}
						isInverted={isInverted}
					>
						{item.title}
					</HeaderNavLink>
				))}
			</Flex>
		</Popover>
	);
};
