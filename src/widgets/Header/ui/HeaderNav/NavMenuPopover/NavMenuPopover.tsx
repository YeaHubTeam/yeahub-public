'use client';

import Link from 'next/link';

import { Flex } from '@/shared/ui/Flex';
import { Icon, IconName } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './NavMenuPopover.module.css';

interface NavMenuPopoverProps {
	columns: {
		id: string;
		title: string;
		subitems: {
			name: string;
			href: string;
			path?: string;
			icon?: IconName;
		}[];
	}[];
	onItemClick: () => void;
	onLinkHover: (title: string) => void;
}

export const NavMenuPopover = ({ columns, onItemClick, onLinkHover }: NavMenuPopoverProps) => {
	return (
		<div className={styles['popover-menu']}>
			<Flex gap="40">
				{columns.map((column) => (
					<div key={column.id} className={styles.column}>
						<Flex direction="column" gap="4" className={styles['column-items']}>
							<Text variant="body3" color="black-400" className={styles['column-title']}>
								{column.title}
							</Text>
							{column.subitems.map((subitem) => (
								<Link
									key={subitem.href}
									href={subitem.href}
									onClick={onItemClick}
									onMouseEnter={() => {
										onLinkHover(column.id);
									}}
									className={`${styles['menu-item']} ${styles['inverted']}`}
								>
									<Flex gap="8">
										<Icon icon={subitem.icon || 'cursor'} size={20} color="black-900" />
										<Text variant="body3-accent" className={styles['nav-link-text']}>
											{subitem.name}
										</Text>
									</Flex>
									<Icon icon="arrowRight" size={20} color="black-900" />
								</Link>
							))}
						</Flex>
					</div>
				))}
			</Flex>
		</div>
	);
};
