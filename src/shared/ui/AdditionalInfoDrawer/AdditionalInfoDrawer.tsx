'use client';

import { ReactNode } from 'react';

import classNames from 'classnames';

import PopoverIcon from '@/shared/assets/icons/diplomaVerified.svg';
import { useModal, useScreenSize } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Drawer } from '@/shared/ui/Drawer';
import { IconButton } from '@/shared/ui/IconButton';

import styles from './AdditionalInfoDrawer.module.css';

interface AdditionalInfoDrawerProps {
	children: ReactNode;
}

export const AdditionalInfoDrawer = ({ children }: AdditionalInfoDrawerProps) => {
	const { isMobileS } = useScreenSize();
	const { isOpen, onToggle, onClose } = useModal();

	return (
		<>
			<IconButton
				className={classNames(styles.button, { active: isOpen })}
				form="square"
				icon={<PopoverIcon />}
				size="small"
				variant="tertiary"
				onClick={onToggle}
			/>
			<Drawer
				isOpen={isOpen}
				onClose={onClose}
				className={classNames(styles.drawer, {
					[styles['drawer-mobile']]: isMobileS,
				})}
				hasCloseButton
			>
				<Card className={styles.main}>{children}</Card>
			</Drawer>
		</>
	);
};
