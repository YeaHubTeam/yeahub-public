import { ResumeAnalysis } from '@/entities/vacancy';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';

import { ResumeAnalyzerBadge } from './ResumeAnalyzerBadge/ResumeAnalyzerBadge';
import { ResumeAnalyzerHeader } from './ResumeAnalyzerHeader/ResumeAnalyzerHeader';

interface ResumeAnalyzerPageProps {
	data: ResumeAnalysis;
}

export const ResumeAnalyzerPage = ({ _data }: ResumeAnalyzerPageProps) => {
	return (
		<>
			<Flex>
				<BackButton />
			</Flex>
			<Flex componentType="section" direction="column" gap="20">
				<ResumeAnalyzerHeader />
				<ResumeAnalyzerBadge />
			</Flex>
		</>
	);
};
