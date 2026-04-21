import React from 'react';

import { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { Main, i18Namespace } from '@/shared/config';
import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import styles from './layout.module.css';

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
			default: t(Main.PROJECT_TITLE),
		},
		description: t(Main.PROJECT_DESCRIPTION),
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

	setRequestLocale(locale);

	const messages = await getMessages({ locale });
	const t = await getTranslations({ locale, namespace: i18Namespace.main });

	const jsonLd = {
		'@context': 'http://schema.org/',
		'@type': 'WPHeader',
		headline: t(Main.PROJECT_TITLE),
	};

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<Header />
			<main className={styles.main}>
				<div className={styles['main-content']}>{children}</div>
			</main>
			<Footer />
			<div id="drawer-root" />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			></script>
		</NextIntlClientProvider>
	);
};

export default LocaleLayout;
