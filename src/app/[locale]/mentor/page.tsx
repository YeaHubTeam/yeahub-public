import { setRequestLocale } from 'next-intl/server';

import { MentorPage as MentorPageComponent } from '@/pages/MentorPage';

interface PageProps {
	params: Promise<{ locale: string }>;
}

const MentorPage = async ({ params }: PageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	return <MentorPageComponent />;
};

export default MentorPage;
