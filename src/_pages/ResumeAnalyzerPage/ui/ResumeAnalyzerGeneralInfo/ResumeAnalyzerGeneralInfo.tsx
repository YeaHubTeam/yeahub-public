import type { ResumeAnalysis } from '@/entities/vacancy';

import { AnalysisInfo } from './AnalysisInfo/AnalysisInfo';
import { MetricCards } from './MetricCards/MetricCards';
import { OverallVacancyCoverage } from './OverallVacancyCoverage/OverallVacancyCoverage';

interface ResumeAnalyzerGeneralInfoProps {
	data: ResumeAnalysis;
}

export const ResumeAnalyzerGeneralInfo = ({ data }: ResumeAnalyzerGeneralInfoProps) => {
	return (
		<>
			<AnalysisInfo />
			<MetricCards
				tasks={data.tasks}
				keywords={data.keywords}
				priority={data.profile.profileQualityScore}
				skills={data.skills}
			/>
			<OverallVacancyCoverage percent={data.overall.score} />
		</>
	);
};
