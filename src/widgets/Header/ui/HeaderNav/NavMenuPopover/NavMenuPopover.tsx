'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import classNames from 'classnames';

import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { NavLink } from '../../../model/types/headerTypes';
import styles from './NavMenuPopover.module.css';

interface NavMenuPopoverProps {
	columns: NavLink[];
	onItemClick: () => void;
	isInverted: boolean;
}

export const NavMenuPopover = ({ columns, onItemClick, isInverted }: NavMenuPopoverProps) => {
	const pathname = usePathname();

	return (
		<div className={classNames(styles['popover-menu'], { [styles.inverted]: isInverted })}>
			<Flex gap="40" className={styles['popover-list']}>
				{columns.map((column) => (
					<div key={column.id} className={styles.column}>
						<Flex direction="column" gap="4" className={styles['column-items']}>
							<Text variant="body3" color="black-400" className={styles['column-title']}>
								{column.title}
							</Text>
							{column.subitems.map((subitem) => (
								<Link
									key={subitem.link}
									href={subitem.link}
									onClick={onItemClick}
									className={classNames(styles['menu-item'], {
										[styles.inverted]: isInverted,
										[styles.active]: pathname.includes(subitem.path),
									})}
								>
									<Flex gap="8">
										<Icon icon={subitem.icon || 'cursor'} size={20} />
										<Text variant="body3-accent" className={styles['nav-link-text']}>
											{subitem.title}
										</Text>
									</Flex>
									<Icon icon="arrowRight" size={20} />
								</Link>
							))}
						</Flex>
					</div>
				))}
			</Flex>
		</div>
	);
};
