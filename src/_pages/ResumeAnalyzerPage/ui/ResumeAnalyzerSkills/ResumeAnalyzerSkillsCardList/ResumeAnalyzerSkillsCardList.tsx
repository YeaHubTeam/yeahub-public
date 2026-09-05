'use client';

import { useState } from 'react';

import type { PercentItem } from '@/entities/vacancy';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAlyzerSkillsCardList.module.css';

type ResumeAnalyzerSkillsCardListProps = {
	keywords: PercentItem[];
	color: 'purple' | 'red';
	title: string;
};

export const ResumeAnalyzerSkillsCardList = ({
	keywords,
	color,
	title,
}: ResumeAnalyzerSkillsCardListProps) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	return (
		<Flex direction="column" gap="12" maxWidth>
			<Text variant="body3-accent">{`${title} (${keywords.length})`}</Text>
			<>
				{keywords.length !== 0
					? keywords.slice(0, isExpanded ? keywords.length : 8).map((keyword, index) => (
							<div key={`${keyword.title}-${index}`} className={styles.skill}>
								<Flex justify="between" align="center" gap="8">
									<Text variant="body3-accent">{keyword.title}</Text>
									<Text variant="body3-accent">{Math.ceil(keyword.percent)}%</Text>
								</Flex>
								<ProgressBar
									className={styles.progress}
									currentCount={keyword.percent}
									totalCount={100}
									variant="medium"
									color={color}
								/>
							</div>
						))
					: null}
			</>
			{keywords.length > 8 ? (
				<Button
					variant="link"
					size="medium"
					suffix={<Icon icon="arrowShortDown" size={24} color="purple-700" aria-hidden />}
					className={styles.link}
					onClick={() => setIsExpanded((value) => !value)}
				>
					Показать все
				</Button>
			) : null}
		</Flex>
	);
};
