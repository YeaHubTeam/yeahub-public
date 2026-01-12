import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import LandingPage from './landing/page';

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

	return (
		<>
			<LandingPage />
		</>
	);
};

export default HomePage;
