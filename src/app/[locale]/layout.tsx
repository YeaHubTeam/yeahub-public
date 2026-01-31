import React from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import styles from './layout.module.css';

interface LocaleLayoutProps {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	const messages = await getMessages({ locale });

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<Header />
			<main className={styles.main}>
				<div className={styles['main-content']}>{children}</div>
			</main>
			<Footer />
		</NextIntlClientProvider>
	);
};

export default LocaleLayout;
