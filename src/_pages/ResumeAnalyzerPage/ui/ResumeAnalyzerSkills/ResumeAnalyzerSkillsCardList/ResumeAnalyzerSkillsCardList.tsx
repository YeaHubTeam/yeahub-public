'use client';

import { useState } from 'react';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { ProgressBar, ProgressBarColor } from '@/shared/ui/ProgressBar';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAlyzerSkillsCardList.module.css';
import { ResumeAnalyzerSkillsCardListItem } from './ResumeAnalyzerSkillsCardListItem/ResumeAnalyzerSkillsCardListItem';

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
					<ResumeAnalyzerSkillsCardListItem
						key={`${skill.title}-${index}`}
						color={color}
						skill={skill}
					/>
				))}
			</>
			{skills.length > defaultAmountToShow && (
				<Flex align="start">
					<ShowToggleButton
						isExpanded={isExpanded}
						onToggle={() => setIsExpanded((prev) => !prev)}
					/>
				</Flex>
			)}
		</Flex>
	);
};
