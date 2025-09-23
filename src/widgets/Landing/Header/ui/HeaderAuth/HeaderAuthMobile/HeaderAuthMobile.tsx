'use client';

import React from 'react';

import { useTranslations } from 'next-intl';

import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';

import { AUTH_LINKS } from '../../../model/constants/headerConstants';
import styles from './HeaderAuthMobile.module.css';

export const HeaderAuthMobile = () => {
	const t = useTranslations('landing.header.auth');

	const authMenuLinks: PopoverMenuItem[] = [
		{
			renderComponent: (onToggle) => (
				<Flex onClick={onToggle}>
					<a href={AUTH_LINKS.login} rel="noopener noreferrer" className={styles.link}>
						{t('signIn')}
					</a>
				</Flex>
			),
		},
		{
			renderComponent: (onToggle) => (
				<Flex onClick={onToggle}>
					<a href={AUTH_LINKS.register} rel="noopener noreferrer" className={styles.link}>
						{t('signUp')}
					</a>
				</Flex>
			),
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
					aria-label={t('menuAria', { default: 'Auth menu' })}
				/>
			)}
		</Popover>
	);
};
