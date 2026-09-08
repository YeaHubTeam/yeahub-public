'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';

import { ComparisonList } from '../ComparisonList/ComparisonList';
import styles from './ResumeAnalyzerAchievements.module.css';
import { ResumeAnalyzerAchievementsHeader } from './ResumeAnalyzerAchievementsHeader/ResumeAnalyzerAchievementsHeader';

const ITEMS_LIMIT = 4;

interface ResumeAnalyzerAchievementsProps {
	profile: ResumeAnalysis['profile'];
}

export const ResumeAnalyzerAchievements = ({ profile }: ResumeAnalyzerAchievementsProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const [isExpanded, setIsExpanded] = useState(false);

	const { quantifiedAchievementsPercent, quantifiedAchievements, unquantifiedAchievements } =
		profile;

	const hasQuantified = quantifiedAchievements.length > 0;
	const hasUnquantified = unquantifiedAchievements.length > 0;

	if (!hasQuantified && !hasUnquantified) {
		return null;
	}

	const displayedCoveragePercent = Math.floor(quantifiedAchievementsPercent);

	const visibleQuantified = isExpanded
		? quantifiedAchievements
		: quantifiedAchievements.slice(0, ITEMS_LIMIT);

	const visibleUnquantified = isExpanded
		? unquantifiedAchievements
		: unquantifiedAchievements.slice(0, ITEMS_LIMIT);

	const shouldShowToggle =
		quantifiedAchievements.length > ITEMS_LIMIT || unquantifiedAchievements.length > ITEMS_LIMIT;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			titleComponent={
				<ResumeAnalyzerAchievementsHeader
					title={t(Vacancies.ACHIEVEMENTS_TITLE, { fallback: 'Достижение' })}
					coverageText={t(Vacancies.RESUME_ANALYZER_ACHIEVEMENTS_COVERAGE, {
						percent: displayedCoveragePercent,
						fallback: `${displayedCoveragePercent} найдено`,
					})}
				/>
			}
		>
			<Flex direction="column" align="start" gap="20">
				{hasQuantified && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_ACHIEVEMENTS_GOOD, {
							fallback: 'Хорошие достижения',
						})}
						variant="success"
						items={visibleQuantified}
					/>
				)}
				{hasUnquantified && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_ACHIEVEMENTS_IMPROVE, {
							fallback: 'Требуют доработки',
						})}
						variant="error"
						items={visibleUnquantified}
					/>
				)}
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
