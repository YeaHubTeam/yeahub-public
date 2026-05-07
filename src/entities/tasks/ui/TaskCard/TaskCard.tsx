import { useTranslations } from 'next-intl';

import { Tasks, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';
import { Tooltip } from '@/shared/ui/Tooltip';

import { taskCategories } from '../../model/constants/task';
import { TaskCategoryCode, TaskDifficulty } from '../../model/types/task';
import { TaskDifficultyChip } from '../TaskDifficultyChip/TaskDifficultyChip';
import styles from './TaskCard.module.css';

export interface TasksCardProps {
	id: string;
	name: string;
	difficulty: TaskDifficulty;
	mainCategory: TaskCategoryCode;
	canSolve: boolean;
	languagesSlot?: React.ReactNode;
}

export const TaskCard = ({
	id,
	name,
	difficulty,
	mainCategory,
	languagesSlot,
	canSolve,
}: TasksCardProps) => {
	const t = useTranslations(i18Namespace.tasks);

	return (
		<Tooltip shouldShowTooltip={!canSolve} title={t(Tasks.NOT_AVAILABLE)} placement="right">
			<Card key={id} withOutsideShadow className={styles.content}>
				<Flex direction="column" gap="8">
					{canSolve ? (
						<Text variant="body4" maxRows={2}>
							{name}
						</Text>
					) : (
						<Skeleton variant="blur" text={<Text variant="body4">{t(Tasks.TITLE_HIDE)}</Text>} />
					)}
					<Flex direction="row" gap="10" align="center">
						<TaskDifficultyChip key={id} difficulty={difficulty} />
						{languagesSlot}
						<StatusChip
							status={{
								variant: 'green',
								text: t(taskCategories[mainCategory]),
							}}
							size="medium"
						/>
					</Flex>
				</Flex>
			</Card>
		</Tooltip>
	);
};
