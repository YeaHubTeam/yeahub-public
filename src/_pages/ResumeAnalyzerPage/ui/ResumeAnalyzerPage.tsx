import { ResumeAnalysis } from '@/entities/vacancy';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';

import { ResumeAnalyzerBadge } from './ResumeAnalyzerBadge/ResumeAnalyzerBadge';
import { ResumeAnalyzerGeneralInfo } from './ResumeAnalyzerGeneralInfo/ResumeAnalyzerGeneralInfo';
import { ResumeAnalyzerHeader } from './ResumeAnalyzerHeader/ResumeAnalyzerHeader';

interface ResumeAnalyzerPageProps {
	data: ResumeAnalysis;
}

export const ResumeAnalyzerPage = ({ data }: ResumeAnalyzerPageProps) => {
	return (
		<>
			<Flex>
				<BackButton />
			</Flex>
			<Flex componentType="section" direction="column" gap="20">
				<ResumeAnalyzerHeader />
				<ResumeAnalyzerBadge />
				<ResumeAnalyzerGeneralInfo data={data} />
			</Flex>
		</>
	);
};
