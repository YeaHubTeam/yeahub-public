import React from 'react';

import { Flex } from '@/shared/ui/Flex';

import { HeaderNavLink } from '../../HeaderNavLink/HeaderNavLink';

type NavItem = { href: string; path: string; label: string };

export const HeaderNavDesktop = ({ items }: { items: NavItem[] }) => {
	return (
		<Flex dataTestId="HeaderNavDesktop_Wrapper" gap="6">
			{items.map(({ href, path, label }) => (
				<HeaderNavLink key={href} link={href} path={path}>
					{label}
				</HeaderNavLink>
			))}
		</Flex>
	);
};
