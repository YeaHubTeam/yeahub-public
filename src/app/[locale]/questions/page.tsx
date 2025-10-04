import React from 'react';

import { setRequestLocale } from 'next-intl/server';

import { PublicQuestionsPage } from '@/pages-components/PublicQuestionsPage';
import { locales } from '@/shared/config/i18n/i18n.locales';

interface QuestionsPageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ [key: string]: string | undefined }>;
}

// TODO: необходимо изменить АПИ для SSG
export const generateStaticParams = () => {
	const pagesToGenerate = 5;
	const params = [];

	for (const locale of locales) {
		for (let page = 1; page <= pagesToGenerate; page++) {
			params.push({ locale });
		}
	}

	return params;
};

const QuestionsPage = async ({ params, searchParams }: QuestionsPageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { page } = await searchParams;

	return <PublicQuestionsPage locale={locale} page={Number(page) || 1} />;
};

export default QuestionsPage;
