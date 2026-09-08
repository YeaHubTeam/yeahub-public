'use client';

import { useState } from 'react';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ProgressBar, ProgressBarColor } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAlyzerSkillsCardList.module.css';

type ResumeAnalyzerSkillsCardListProps = {
	skills: ResumeAnalysis['skills']['matchedSkills'];
	color: ProgressBarColor;
	title: string;
};

export const ResumeAnalyzerSkillsCardList = ({
	skills,
	color,
	title,
}: ResumeAnalyzerSkillsCardListProps) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const defaultAmountToShow = 8;
	const visibleSkills = isExpanded ? skills : skills.slice(0, defaultAmountToShow);
	return (
		<Flex direction="column" gap="12" maxWidth>
			<Text variant="body3-accent">{title}</Text>
			<>
				{visibleSkills.map((skill, index) => (
					<Flex key={`${skill.title}-${index}`} gap="4" direction="column">
						<Flex justify="between" align="center" gap="8">
							<Text variant="body3-accent">{skill.title}</Text>
							<Text variant="body3-accent">{Math.ceil(skill.percent)}%</Text>
						</Flex>
						<ProgressBar
							className={styles.progress}
							currentCount={skill.percent}
							totalCount={100}
							variant="medium"
							color={color}
						/>
					</Flex>
				))}
			</>
			{skills.length > defaultAmountToShow ? (
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
