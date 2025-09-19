'use client';

import React from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { locales } from '@/shared/config/i18n.locales';
import { usePathname, useRouter } from '@/shared/config/navigation';

export const LanguageSwitcher = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations('language');

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
		return localeCode === 'ru' ? t('russian') : t('english');
	};

	return (
		<div>
			<span>{t('label')}</span>
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
