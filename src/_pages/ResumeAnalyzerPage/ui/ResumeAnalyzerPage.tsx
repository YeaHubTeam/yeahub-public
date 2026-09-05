import { ResumeAnalysis } from '@/entities/vacancy';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';

import { ResumeAnalyzerBadge } from './ResumeAnalyzerBadge/ResumeAnalyzerBadge';
import { ResumeAnalyzerHeader } from './ResumeAnalyzerHeader/ResumeAnalyzerHeader';
import { ResumeAnalyzerSkillsCard } from './ResumeAnalyzerSkills/ResumeAnalyzerSkillsCard';

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
				<ResumeAnalyzerSkillsCard />
			</Flex>
		</>
	);
};
