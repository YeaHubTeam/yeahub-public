'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Keywords } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';

import { KeywordGroup } from '../KeywordGroup/KeywordGroup';
import styles from './KeywordsInteractive.module.css';

const KEYWORDS_PREVIEW_LIMITS = {
	matched: 8,
	missing: 8,
	optional: 5,
	critical: 5,
} as const;

type KeywordsInteractiveProps = {
	keywords: Keywords;
};

export const KeywordsInteractive = ({ keywords }: KeywordsInteractiveProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	const [isExpanded, setIsExpanded] = useState(false);

	const keywordGroups = [
		{
			title: t(Vacancies.RESUME_ANALYZER_KEYWORDS_GROUP_MATCHED, {
				count: keywords.matchedKeywords.length,
			}),
			keywords: keywords.matchedKeywords,
			limit: KEYWORDS_PREVIEW_LIMITS.matched,
			variant: 'matched' as const,
		},
		{
			title: t(Vacancies.RESUME_ANALYZER_KEYWORDS_GROUP_MISSING, {
				count: keywords.missingKeywords.length,
			}),
			keywords: keywords.missingKeywords,
			limit: KEYWORDS_PREVIEW_LIMITS.missing,
			variant: 'missing' as const,
		},
		{
			title: t(Vacancies.RESUME_ANALYZER_KEYWORDS_GROUP_OPTIONAL, {
				count: keywords.optionalKeywords.length,
			}),
			keywords: keywords.optionalKeywords,
			limit: KEYWORDS_PREVIEW_LIMITS.optional,
			variant: 'optional' as const,
		},
		{
			title: t(Vacancies.RESUME_ANALYZER_KEYWORDS_GROUP_CRITICAL, {
				count: keywords.criticalKeywords.length,
			}),
			keywords: keywords.criticalKeywords,
			limit: KEYWORDS_PREVIEW_LIMITS.critical,
			variant: 'critical' as const,
		},
	];

	const hasHiddenKeywords = keywordGroups.some(
		({ keywords: groupKeywords, limit }) => groupKeywords.length > limit,
	);

	return (
		<>
			<div className={styles.wrapper}>
				{keywordGroups.map((group) => (
					<KeywordGroup
						key={group.variant}
						title={group.title}
						keywords={group.keywords}
						limit={group.limit}
						variant={group.variant}
						isExpanded={isExpanded}
					/>
				))}
			</div>
			{hasHiddenKeywords && (
				<ShowToggleButton isExpanded={isExpanded} onToggle={() => setIsExpanded((prev) => !prev)} />
			)}
		</>
	);
};
