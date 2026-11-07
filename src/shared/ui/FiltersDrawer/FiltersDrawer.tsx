'use client';

import { ReactNode } from 'react';

import classNames from 'classnames';

import { useModal, useScreenSize } from '@/shared/libs';
import { Drawer } from '@/shared/ui/Drawer';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';

import styles from './FiltersDrawer.module.css';

interface FiltersDrawerProps {
	children: ReactNode;
	hasFilters?: boolean;
	className?: string;
	breakpoint?: 1024 | 1280;
}

export const FiltersDrawer = ({
	children,
	hasFilters,
	className,
	breakpoint = 1024,
}: FiltersDrawerProps) => {
	const { isOpen, onToggle, onClose } = useModal();
	const { isMobileS } = useScreenSize();
	const breakpointClass = breakpoint === 1280 && styles['breakpoint-1280'];

	return (
		<>
			<IconButton
				aria-label="go to filter"
				icon={<Icon icon="filter" size={24} />}
				size="medium"
				variant="tertiary"
				onClick={onToggle}
				isActive={hasFilters}
				className={classNames(styles['filter-button'], breakpointClass, className)}
			/>

			{isOpen && (
				<Drawer
					className={classNames(styles.drawer, {
						[styles['drawer-mobile']]: isMobileS,
					})}
					hasCloseButton
					isOpen={isOpen}
					onClose={onClose}
					position="right"
				>
					<section className={classNames(styles.filter, breakpointClass)}>{children}</section>
				</Drawer>
			)}
		</>
	);
};
