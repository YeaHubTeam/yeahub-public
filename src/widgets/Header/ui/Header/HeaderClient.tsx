'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import classnames from 'classnames';

import { INVERTED_THEME_URLS } from '@/widgets/Header/model/constants/headerConstants';

import styles from './Header.module.css';

interface HeaderClientProps {
	children: React.ReactNode;
}

export const HeaderClient = ({ children }: HeaderClientProps) => {
	const pathname = usePathname();

	const isInverted = INVERTED_THEME_URLS.some((url) => pathname.slice(3) === url);

	return (
		<header
			data-testid="Header"
			className={classnames(styles.header, { [styles.inverted]: isInverted })}
		>
			{children}
		</header>
	);
};
