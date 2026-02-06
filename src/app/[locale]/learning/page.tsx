import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LearningPage as LearningPageComponent } from '@/pages/LearningPage';
import { Learning, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.learning });

	const title = t(Learning.BANNER_TITLE);
	const description = t(Learning.BANNER_DESCRIPTION);
	const keywords = [
		title,
		t(Learning.PROCESS_TITLE),
		t(Learning.TEAM_TITLE),
		t(Learning.SUPPORT_TITLE),
		t(Learning.PROJECT_TITLE),
		t(Learning.EXPERIENCE_TITLE),
		t(Learning.MENTORS_TITLE),
		t(Learning.GURU_TITLE),
	];

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: 'website',
		},
	};
}

const LearningPage = () => {
	return <LearningPageComponent />;
};

export default LearningPage;
