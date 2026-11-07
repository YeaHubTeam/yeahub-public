import React from 'react';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { Main, i18Namespace, routing } from '@/shared/config';

interface LocaleLayoutProps {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.main });

	const isProd = process.env.NEXT_PUBLIC_IS_PROD === 'production';

	return {
		title: {
			template: '%s | Yeahub',
			default: t(Main.SEO_TITLE),
		},
		description: t(Main.SEO_DESCRIPTION),
		keywords: t(Main.SEO_KEYWORDS),
		robots: isProd
			? {
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						'max-snippet': -1,
					},
				}
			: {
					index: false,
					follow: false,
				},
	};
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages({ locale });

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			{children}
			<div id="drawer-root" />
		</NextIntlClientProvider>
	);
};

export default LocaleLayout;
