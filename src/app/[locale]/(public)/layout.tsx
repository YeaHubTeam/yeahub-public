import type { ReactNode } from 'react';

import { getTranslations } from 'next-intl/server';

import { Main, i18Namespace } from '@/shared/config';
import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import styles from './layout.module.css';

const PublicLayout = async ({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.main });
	const jsonLd = {
		'@context': 'http://schema.org/',
		'@type': 'WPHeader',
		headline: t(Main.PROJECT_TITLE),
	};
	return (
		<>
			<Header />
			<main className={styles.main}>
				<div className={styles['main-content']}>{children}</div>
			</main>
			<Footer />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
		</>
	);
};

export default PublicLayout;
