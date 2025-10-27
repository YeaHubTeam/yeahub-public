'use client';

import React from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { i18Namespace, locales } from '@/shared/config';
import { Main } from '@/shared/config';
import { usePathname, useRouter } from '@/shared/config';

export const LanguageSwitcher = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations(i18Namespace.main);

	const handleLanguageChange = (newLocale: string) => {
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

	const getLocaleName = (localeCode: string) => {
		return localeCode === 'ru' ? t(Main.HOME_LANGUAGE_RUSSIAN) : t(Main.HOME_LANGUAGE_ENGLISH);
	};

	return (
		<div>
			<span>{t(Main.HOME_LANGUAGE_LABEL)}</span>
			<div>
				{locales.map((localeOption) => (
					<button
						key={localeOption}
						onClick={() => handleLanguageChange(localeOption)}
						className={`${locale === localeOption ? 'active' : ''}`}
						disabled={locale === localeOption}
					>
						{getLocaleName(localeOption)}
					</button>
				))}
			</div>
		</div>
	);
};
