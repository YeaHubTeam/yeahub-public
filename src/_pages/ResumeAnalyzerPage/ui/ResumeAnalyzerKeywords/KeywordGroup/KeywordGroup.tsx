import classNames from 'classnames';

import type { PercentItem } from '@/entities/vacancy';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { Tooltip } from '@/shared/ui/Tooltip';

import styles from './KeywordGroup.module.css';

type KeywordGroupVariant = 'matched' | 'missing' | 'optional' | 'critical';

type KeywordGroupProps = {
	title: string;
	keywords: PercentItem[];
	limit: number;
	isExpanded: boolean;
	variant: KeywordGroupVariant;
};

const keywordClassByVariant = {
	matched: styles.purple,
	optional: styles.purple,
	missing: styles.red,
	critical: styles.critical,
} as const;

export const KeywordGroup = ({
	title,
	keywords,
	limit,
	isExpanded,
	variant,
}: KeywordGroupProps) => {
	const visibleKeywords = isExpanded ? keywords : keywords.slice(0, limit);
	const hiddenKeywords = isExpanded ? [] : keywords.slice(limit);

	return (
		<Flex direction="column" gap="12">
			<Text variant="body3-accent">{title}</Text>

			<Flex gap="12" wrap="wrap" align="center">
				{visibleKeywords.map((keyword) => (
					<Chip
						className={classNames(
							styles['keyword-group'],
							styles.keyword,
							keywordClassByVariant[variant],
						)}
						disablePointer
						key={keyword.title}
						label={keyword.title}
					/>
				))}

				{hiddenKeywords.length > 0 && (
					<Tooltip
						placement="top-start"
						title={hiddenKeywords.map((keyword) => keyword.title).join(', ')}
					>
						<Text variant="body3-accent" color="black-500">
							+{hiddenKeywords.length}
						</Text>
					</Tooltip>
				)}
			</Flex>
		</Flex>
	);
};
