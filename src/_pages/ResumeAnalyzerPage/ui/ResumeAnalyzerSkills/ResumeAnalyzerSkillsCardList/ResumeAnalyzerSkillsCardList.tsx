'use client';

import { useState } from 'react';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';
import { ProgressBarColor } from '@/shared/ui/ProgressBar';
import { ShowToggleButton } from '@/shared/ui/ShowToggleButton';
import { Text } from '@/shared/ui/Text';

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
		<Flex direction="column" gap="20" maxWidth align="start">
			<Flex direction="column" gap="12" maxWidth>
				<Text variant="body3-accent">{title}</Text>
				<Flex direction="column" gap="12">
					{visibleSkills.map((skill, index) => (
						<ResumeAnalyzerSkillsCardListItem
							key={`${skill.title}-${index}`}
							color={color}
							skill={skill}
						/>
					))}
				</Flex>
			</Flex>
			{skills.length > defaultAmountToShow && (
				<ShowToggleButton isExpanded={isExpanded} onToggle={() => setIsExpanded((prev) => !prev)} />
			)}
		</Flex>
	);
};
