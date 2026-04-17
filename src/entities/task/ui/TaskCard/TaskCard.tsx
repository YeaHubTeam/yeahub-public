import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import type { TaskListItem } from '../../model/types/task';
import { TaskDifficultyChip } from '../TaskDifficultyChip/TaskDifficultyChip';
import styles from './TaskCard.module.css';

type TaskCardProps = {
	task: TaskListItem;
	className?: string;
};

export const TaskCard = ({ task, className }: TaskCardProps) => {
	const { name, difficulty, supportedLanguages, mainCategory } = task;

	return (
		<Card withOutsideShadow className={`${styles.content} ${className ?? ''}`}>
			<Flex direction="column" gap="12" flex={1} className={styles.wrapper}>
				<Text variant="body3-accent" maxRows={2}>
					{name}
				</Text>
				<Flex align="center" wrap="wrap" gap="8">
					<TaskDifficultyChip difficulty={difficulty} />
					{(supportedLanguages ?? []).map((lang) => (
						<Chip key={lang.id} label={lang.name} />
					))}
					{mainCategory && <Chip label={mainCategory} />}
				</Flex>
			</Flex>
		</Card>
	);
};
