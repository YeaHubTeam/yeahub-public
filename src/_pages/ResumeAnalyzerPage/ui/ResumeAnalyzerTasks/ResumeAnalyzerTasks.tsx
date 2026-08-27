'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Translation, Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { MatchedTasksSection } from './MatchedTasksSection/MatchedTasksSection';
import { MissingTasksSection } from './MissingTasksSection/MissingTasksSection';
import { RecommendationsSection } from './RecommendationsSection/RecommendationsSection';
import styles from './ResumeAnalyzerTasks.module.css';
import { ResumeAnalyzerTasksHeader } from './ResumeAnalyzerTasksHeader/ResumeAnalyzerTasksHeader';
import { ResumeAnalyzerTasksToggle } from './ResumeAnalyzerTasksToggle/ResumeAnalyzerTasksToggle';

const ITEMS_LIMIT = 3;

interface ResumeAnalyzerTasksProps {
	tasks: ResumeAnalysis['tasks'];
}

export const ResumeAnalyzerTasks = ({ tasks }: ResumeAnalyzerTasksProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	const tCommon = useTranslations(i18Namespace.translation);

	const [isExpanded, setIsExpanded] = useState(false);

	const displayedCoveragePercent = Math.floor(tasks.coveragePercent);

	const matchedTasks = tasks.matchedTasks.filter(({ matchType }) => matchType === 'full');

	const visibleMatchedTasks = isExpanded ? matchedTasks : matchedTasks.slice(0, ITEMS_LIMIT);

	const visibleMissingTasks = isExpanded
		? tasks.missingTasks
		: tasks.missingTasks.slice(0, ITEMS_LIMIT);

	const visibleRecommendations = isExpanded
		? tasks.recommendations
		: tasks.recommendations.slice(0, ITEMS_LIMIT);

	const shouldShowToggle =
		matchedTasks.length > ITEMS_LIMIT ||
		tasks.missingTasks.length > ITEMS_LIMIT ||
		tasks.recommendations.length > ITEMS_LIMIT;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			titleComponent={
				<ResumeAnalyzerTasksHeader
					title={t(Vacancies.TASKS_TITLE)}
					coverageText={t(Vacancies.RESUME_ANALYZER_TASKS_COVERAGE, {
						percent: displayedCoveragePercent,
					})}
				/>
			}
		>
			<Flex direction="column" align="start" gap="20">
				<MatchedTasksSection
					title={t(Vacancies.RESUME_ANALYZER_TASKS_MATCHED)}
					tasks={visibleMatchedTasks}
				/>

				<MissingTasksSection
					title={t(Vacancies.RESUME_ANALYZER_TASKS_MISSING)}
					tasks={visibleMissingTasks}
				/>

				<RecommendationsSection
					title={t(Vacancies.RESUME_ANALYZER_TASKS_RECOMMENDATIONS)}
					recommendations={visibleRecommendations}
				/>

				{shouldShowToggle && (
					<ResumeAnalyzerTasksToggle
						isExpanded={isExpanded}
						label={isExpanded ? tCommon(Translation.HIDE) : tCommon(Translation.SHOW_ALL)}
						onToggle={() => setIsExpanded((value) => !value)}
					/>
				)}
			</Flex>
		</Card>
	);
};
