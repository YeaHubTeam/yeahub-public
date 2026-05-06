'use client';

import { useTranslations } from 'next-intl';

import { Tasks, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TaskDifficulty } from '../../model/types/task';
import { TaskDifficultyChip } from '../TaskDifficultyChip/TaskDifficultyChip';

interface DifficultFilterSectionProps {
	selectedDifficulty?: TaskDifficulty;
	onChangeDifficulty: (value?: TaskDifficulty) => void;
}

const DIFFICULTIES: TaskDifficulty[] = [1, 2, 3, 4, 5];

export const DifficultFilterSection = ({
	selectedDifficulty,
	onChangeDifficulty,
}: DifficultFilterSectionProps) => {
	const t = useTranslations(i18Namespace.tasks);

	const handleClick = (id: TaskDifficulty) => {
		onChangeDifficulty(selectedDifficulty === id ? undefined : id);
	};

	return (
		<Flex direction="column" gap="8">
			<Text variant="body2" color="black-700">
				{t(Tasks.DIFFICULTY_TITLE_SHORT)}
			</Text>
			<Flex gap="8">
				{DIFFICULTIES.map((d) => (
					<TaskDifficultyChip
						key={d}
						difficulty={d}
						active={selectedDifficulty === d}
						onClick={() => handleClick(d)}
					/>
				))}
			</Flex>
		</Flex>
	);
};
