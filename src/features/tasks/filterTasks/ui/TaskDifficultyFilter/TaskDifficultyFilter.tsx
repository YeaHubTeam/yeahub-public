'use client';

import classnames from 'classnames';
import { useTranslations } from 'next-intl';

import type { TaskDifficulty } from '@/entities/task';
import { Task, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './TaskDifficultyFilter.module.css';

interface TaskDifficultyFilterProps {
	selectedDifficulty?: TaskDifficulty;
	onChangeDifficulty: (difficulty?: TaskDifficulty) => void;
}

const DIFFICULTIES: TaskDifficulty[] = [1, 2, 3, 4, 5];

export const TaskDifficultyFilter = ({
	selectedDifficulty,
	onChangeDifficulty,
}: TaskDifficultyFilterProps) => {
	const t = useTranslations(i18Namespace.task);

	const onToggle = (id: TaskDifficulty) => {
		onChangeDifficulty(selectedDifficulty === id ? undefined : id);
	};

	return (
		<Flex direction="column" gap="8">
			<Text variant="body2" color="black-700">
				{t(Task.DIFFICULTY_TITLE_SHORT)}
			</Text>
			<Flex wrap="wrap" gap="8">
				{DIFFICULTIES.map((difficulty) => (
					<button
						key={difficulty}
						type="button"
						className={classnames(styles.item, styles[`item-${difficulty}`], {
							[styles.active]: selectedDifficulty === difficulty,
						})}
						onClick={() => onToggle(difficulty)}
					>
						<Flex
							align="center"
							justify="center"
							className={classnames(styles.chip, styles[`difficulty-${difficulty}`])}
						>
							<Text variant="body2-strong" color="white-900">
								{difficulty}
							</Text>
						</Flex>
					</button>
				))}
			</Flex>
		</Flex>
	);
};
