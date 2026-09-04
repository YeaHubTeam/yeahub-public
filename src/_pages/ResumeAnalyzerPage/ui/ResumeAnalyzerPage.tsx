import { ResumeAnalysis } from '@/entities/vacancy';
import { ResumeAnalyzerRecommendations } from '@/pages/ResumeAnalyzerPage/ui/ResumeAnalyzerRecommendations/ResumeAnalyzerRecommendations';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';

import { ResumeAnalyzerBadge } from './ResumeAnalyzerBadge/ResumeAnalyzerBadge';
import { ResumeAnalyzerHeader } from './ResumeAnalyzerHeader/ResumeAnalyzerHeader';

interface ResumeAnalyzerPageProps {
	data: ResumeAnalysis;
}

export const ResumeAnalyzerPage = ({ data }: ResumeAnalyzerPageProps) => {
	console.log(data);

	return (
		<>
			<Flex>
				<BackButton />
			</Flex>
			<Flex componentType="section" direction="column" gap="20">
				<ResumeAnalyzerHeader />
				<ResumeAnalyzerBadge />
				<ResumeAnalyzerRecommendations recommendations={data.profile.recommendations} />
			</Flex>
		</>
	);
};
