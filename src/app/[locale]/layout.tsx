import React from 'react';

import { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { Providers } from '@/lib/providers';
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

	return {
		title: {
			template: '%s | Yeahub',
			default: t(Main.PROJECT_TITLE),
		},
		description: t(Main.PROJECT_DESCRIPTION),
		robots: {
			index: process.env.NEXT_PUBLIC_IS_PROD === 'production',
			follow: process.env.NEXT_PUBLIC_IS_PROD === 'production',
		},
	};
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	const messages = await getMessages({ locale });

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<Providers>
				<Header />
				<main className={styles.main}>
					<div className={styles['main-content']}>{children}</div>
				</main>
				<Footer />
			</Providers>
		</NextIntlClientProvider>
	);
};

export default LocaleLayout;
