import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import NewLandingPage from './new-landing/page';

export const dynamic = 'force-static';

export function generateStaticParams() {
	return ['ru'].map((locale) => ({ locale }));
}

interface HomePageProps {
	params: Promise<{ locale: string }>;
}

const HomePage = async ({ params }: HomePageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<>
			<NewLandingPage params={params} />
		</>
	);
};

export default HomePage;
