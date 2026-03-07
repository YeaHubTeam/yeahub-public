'use client';

import React from 'react';

import { useTranslations } from 'next-intl';

import { AUTH_LINKS, Header, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';
import { UserPlusIcon } from '@/widgets/Header/ui/HeaderAuth/UserPlusIcon';

import styles from './HeaderAuthMobile.module.css';

export const HeaderAuthMobile = () => {
	const t = useTranslations(i18Namespace.header);

	const authMenuLinks: PopoverMenuItem[] = [
		{
			icon: <UserPlusIcon isCurrentColor />,
			title: t(Header.AUTH_SIGN_UP),
			link: AUTH_LINKS.register,
		},
	];

	return (
		<Popover menuItems={authMenuLinks} className={styles['auth-popover']}>
			{({ onToggle }) => (
				<IconButton
					dataTestId="HeaderAuthMobile_IconButton"
					form="square"
					variant="tertiary"
					onClick={onToggle}
					className={styles['burger-button']}
					icon={<Icon icon="burger" size={32} />}
					aria-label={t(Header.AUTH_MENU_ARIA)}
				/>
			)}
		</Popover>
	);
};
