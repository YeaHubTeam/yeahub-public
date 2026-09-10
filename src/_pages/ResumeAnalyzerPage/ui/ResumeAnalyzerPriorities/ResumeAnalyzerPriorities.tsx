'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { ComparisonList } from '../ComparisonList/ComparisonList';
import styles from './ResumeAnalyzerPriorities.module.css';

const ITEMS_LIMIT = 2;

interface ResumeAnalyzerPrioritiesProps {
	profile: ResumeAnalysis['profile'];
}

export const ResumeAnalyzerPriorities = ({ profile }: ResumeAnalyzerPrioritiesProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const [isExpanded, setIsExpanded] = useState(false);

	const visibleMatchedSignals = isExpanded
		? profile.matchedExtraSignals
		: profile.matchedExtraSignals.slice(0, ITEMS_LIMIT);

	const visibleMissingSignals = isExpanded
		? profile.missingExtraSignals
		: profile.missingExtraSignals.slice(0, ITEMS_LIMIT);

	const visibleWeakSignals = isExpanded
		? profile.weaklySupportedSignals
		: profile.weaklySupportedSignals.slice(0, ITEMS_LIMIT);

	const shouldShowToggle =
		profile.matchedExtraSignals.length > ITEMS_LIMIT ||
		profile.missingExtraSignals.length > ITEMS_LIMIT ||
		profile.weaklySupportedSignals.length > ITEMS_LIMIT;

	const coverageText = t(Vacancies.RESUME_ANALYZER_PRIORITIES_COVERAGE, {
		percent: profile.extraMatchPercent,
	});
	const matchedText = `${profile.coveredExtraCount} / ${profile.totalExtraCount}`;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			titleComponent={
				<Flex direction="column" align="start" gap="20">
					<Flex align="center" gap="8" wrap="wrap">
						<Text variant="body6" color="black-900">
							{t(Vacancies.RESUME_ANALYZER_PRIORITIES_TITLE)}
						</Text>

						<StatusChip
							size="medium"
							status={{
								variant: 'purple',
								text: coverageText,
							}}
						/>
					</Flex>

					<StatusChip
						size="medium"
						status={{
							variant: 'purple',
							text: matchedText,
						}}
					/>
				</Flex>
			}
		>
			<Flex direction="column" align="start" gap="20">
				{visibleMatchedSignals.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PRIORITIES_MATCHED)}
						variant="success"
						items={visibleMatchedSignals}
					/>
				)}

				{visibleMissingSignals.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PRIORITIES_MISSING)}
						variant="error"
						items={visibleMissingSignals}
					/>
				)}

				{visibleWeakSignals.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PRIORITIES_WEAK)}
						variant="warning"
						items={visibleWeakSignals}
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
