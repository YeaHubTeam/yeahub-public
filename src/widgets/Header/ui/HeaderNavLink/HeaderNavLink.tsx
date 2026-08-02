import React, { ReactNode } from 'react';

import classNames from 'classnames';

import { Text } from '@/shared/ui/Text';

import styles from './HeaderNavLink.module.css';

interface HeaderNavLinkProps {
	children: ReactNode;
	isActive?: boolean;
	isInverted: boolean;
}

export const HeaderNavLink = ({ children, isActive, isInverted }: HeaderNavLinkProps) => {
	return (
		<div
			className={classNames(styles['nav-link'], {
				[styles.active]: Boolean(isActive),
			})}
		>
			<Text variant="body3-accent" color={isInverted ? 'white-900' : 'black-900'}>
				{children}
			</Text>
		</div>
	);
};
