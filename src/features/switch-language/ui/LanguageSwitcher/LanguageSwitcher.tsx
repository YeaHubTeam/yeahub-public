'use client';

import React from 'react';

import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/shared/config';
import { Switch } from '@/shared/ui/Switch';

import { Language } from '../../model/types/changingLanguage';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const onChangeLanguage = () => {
		const newLocale: Language = locale === 'en' ? 'ru' : 'en';
		try {
			router.push(pathname, { locale: newLocale });
		} catch {
			const currentPath = window.location.pathname;
			const cleanPath = currentPath.startsWith(`/${locale}`)
				? currentPath.slice(`/${locale}`.length)
				: currentPath;
			window.location.href = `/${newLocale}${cleanPath || ''}`;
		}
	};

	return (
		<Switch
			className={styles.switch}
			switchClassName={styles.wrapper}
			pinClassName={styles.pin}
			checked={locale === 'en'}
			onChange={onChangeLanguage}
		/>
	);
};
