import { ResumeAnalysis } from '@/entities/vacancy';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';

import { ResumeAnalyzerBadge } from './ResumeAnalyzerBadge/ResumeAnalyzerBadge';
import { ResumeAnalyzerHeader } from './ResumeAnalyzerHeader/ResumeAnalyzerHeader';
import styles from './ResumeAnalyzerPage.module.css';
import { ResumeAnalyzerTasks } from './ResumeAnalyzerTasks/ResumeAnalyzerTasks';

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

				<div className={styles.grid}>
					<ResumeAnalyzerTasks tasks={data.tasks} />
				</div>
			</Flex>
		</>
	);
};
