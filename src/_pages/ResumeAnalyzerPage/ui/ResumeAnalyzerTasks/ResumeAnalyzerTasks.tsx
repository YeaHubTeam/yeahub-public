'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';

import { ComparisonList } from '../ComparisonList/ComparisonList';
import { RecommendationsSection } from './RecommendationsSection/RecommendationsSection';
import styles from './ResumeAnalyzerTasks.module.css';
import { ResumeAnalyzerTasksHeader } from './ResumeAnalyzerTasksHeader/ResumeAnalyzerTasksHeader';

const ITEMS_LIMIT = 3;

interface ResumeAnalyzerTasksProps {
	tasks: ResumeAnalysis['tasks'];
}

export const ResumeAnalyzerTasks = ({ tasks }: ResumeAnalyzerTasksProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const [isExpanded, setIsExpanded] = useState(false);

	const displayedCoveragePercent = Math.floor(tasks.coveragePercent);

	const visibleMatchedTasks = isExpanded
		? tasks.matchedTasks
		: tasks.matchedTasks.slice(0, ITEMS_LIMIT);

	const visibleMissingTasks = isExpanded
		? tasks.missingTasks
		: tasks.missingTasks.slice(0, ITEMS_LIMIT);

	const visibleRecommendations = isExpanded
		? tasks.recommendations
		: tasks.recommendations.slice(0, ITEMS_LIMIT);

	const shouldShowToggle =
		tasks.matchedTasks.length > ITEMS_LIMIT ||
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
				<ComparisonList
					title={t(Vacancies.RESUME_ANALYZER_TASKS_MATCHED)}
					variant="success"
					items={visibleMatchedTasks}
				/>
				<ComparisonList
					title={t(Vacancies.RESUME_ANALYZER_TASKS_MISSING)}
					variant="error"
					items={visibleMissingTasks}
				/>
				<RecommendationsSection
					title={t(Vacancies.RESUME_ANALYZER_TASKS_RECOMMENDATIONS)}
					recommendations={visibleRecommendations}
				/>
				{shouldShowToggle && (
					<ShowToggleButton
						isExpanded={isExpanded}
						onToggle={() => setIsExpanded((value) => !value)}
					/>
				)}
			</Flex>
		</Card>
	);
};
