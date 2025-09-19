import React from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LanguageSwitcher } from '@/features/language-switcher';

import styles from './page.module.css';

export const dynamic = 'force-static';

export function generateStaticParams() {
	return ['ru', 'en'].map((locale) => ({ locale }));
}

interface HomePageProps {
	params: Promise<{ locale: string }>;
}

const HomePage = async ({ params }: HomePageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('home');

	return (
		<div className={styles.page}>
			<LanguageSwitcher />
			<main className={styles.main}>
				<ol>
					<li>
						{t('title')} <code>src/app/[locale]/page.tsx</code>.
					</li>
					<li>{t('subtitle')}</li>
				</ol>
				<div className={styles.ctas}>
					<a
						className={styles.primary}
						href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t('deployNow')}
					</a>
					<a
						href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.secondary}
					>
						{t('readDocs')}
					</a>
				</div>
			</main>
		</div>
	);
};

export default HomePage;
