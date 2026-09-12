import { setRequestLocale } from 'next-intl/server';

import { mapResumeAnalysis, resumeAnalysis } from '@/entities/vacancy';
import { ResumeAnalyzerPage } from '@/pages/ResumeAnalyzerPage';

interface ResumeAnalyzerRouteProps {
	params: Promise<{
		locale: string;
	}>;
}

const ResumeAnalyzerRoute = async ({ params }: ResumeAnalyzerRouteProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <ResumeAnalyzerPage data={mapResumeAnalysis(resumeAnalysis)} />;
};

export default ResumeAnalyzerRoute;
