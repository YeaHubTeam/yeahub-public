'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { Flex } from '@/shared/ui/Flex';
import { INVERTED_THEME_URLS } from '@/widgets/Header/model/constants/headerConstants';

import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';
import type { NavItem } from '../types/headerNavTypes';

export const HeaderNavDesktop = ({ items }: { items: NavItem[] }) => {
	const pathname = usePathname();

	const isInverted = INVERTED_THEME_URLS.includes(pathname);

	return (
		<Flex dataTestId="HeaderNavDesktop_Wrapper" gap="6">
			{items.map(({ href, path, label }) => (
				<HeaderNavLink
					key={href}
					link={href}
					path={path}
					isActive={pathname?.includes(path)}
					isInverted={isInverted}
				>
					{label}
				</HeaderNavLink>
			))}
		</Flex>
	);
};
