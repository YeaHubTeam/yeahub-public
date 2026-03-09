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
}

export const FiltersDrawer = ({ children, hasFilters, className }: FiltersDrawerProps) => {
	const { isOpen, onToggle, onClose } = useModal();
	const { isMobileS } = useScreenSize();

	return (
		<>
			<IconButton
				aria-label="go to filter"
				icon={<Icon icon="filter" size={24} />}
				size="medium"
				variant="tertiary"
				onClick={onToggle}
				isActive={hasFilters}
				className={classNames(styles['filter-button'], className)}
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
					<section className={styles['filter']}>{children}</section>
				</Drawer>
			)}
		</>
	);
};
