'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { Flex } from '@/shared/ui/Flex';

import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';

type NavItem = { href: string; path: string; label: string };

export const HeaderNavDesktop = ({ items }: { items: NavItem[] }) => {
	const pathname = usePathname();

	return (
		<Flex dataTestId="HeaderNavDesktop_Wrapper" gap="6">
			{items.map(({ href, path, label }) => (
				<HeaderNavLink key={href} link={href} path={path} isActive={pathname === href}>
					{label}
				</HeaderNavLink>
			))}
		</Flex>
	);
};
