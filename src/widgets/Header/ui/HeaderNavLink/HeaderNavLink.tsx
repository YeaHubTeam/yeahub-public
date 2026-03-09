import React, { ReactNode } from 'react';

import Link from 'next/link';

import classNames from 'classnames';

import { Text } from '@/shared/ui/Text';

import type { HeaderNavLinks } from '../../model/types/headerTypes';
import styles from './HeaderNavLink.module.css';

interface HeaderNavLinkProps extends Pick<HeaderNavLinks, 'link' | 'path'> {
	children: ReactNode;
	isActive?: boolean;
}

export const HeaderNavLink = ({ link, children, isActive }: HeaderNavLinkProps) => {
	return (
		<Link
			href={link}
			className={classNames(styles['nav-link'], styles.link, {
				[styles.active]: Boolean(isActive),
			})}
		>
			<Text variant="body3-accent">{children}</Text>
		</Link>
	);
};
