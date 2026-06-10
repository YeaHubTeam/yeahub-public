'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { INVERTED_THEME_URLS } from '@/widgets/Header/model/constants/headerConstants';

import styles from './Header.module.css';

interface HeaderClientProps {
	children: React.ReactNode;
}

export const HeaderClient = ({ children }: HeaderClientProps) => {
	const pathname = usePathname();

	const isInverted = INVERTED_THEME_URLS.some((url) => pathname?.includes(url));

	const headerClass = `${styles.header} ${isInverted ? styles.inverted : ''}`;

	return (
		<header data-testid="Header" className={headerClass}>
			{children}
		</header>
	);
};
