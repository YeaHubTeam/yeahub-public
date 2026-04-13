'use client';

import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { ROUTES, Task, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import type { StatusChipItem } from '@/shared/ui/StatusChip';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import type { TaskListItem } from '../../model/types/task';
import { TaskDifficultyChip } from '../TaskDifficultyChip/TaskDifficultyChip';
import styles from './TaskCard.module.css';

type TaskCardProps = {
	task: TaskListItem;
	className?: string;
};

export const TaskCard = ({ task, className }: TaskCardProps) => {
	const { id, name, difficulty, status, supportedLanguages, mainCategory } = task;

	const t = useTranslations(i18Namespace.task);

	const taskPath = route(ROUTES.tasks.detail.page, String(id));

	const getStatusChip = (): StatusChipItem | null => {
		if (status === 'SOLVED') return { variant: 'green', text: t(Task.STATUS_SOLVED) };
		if (status === 'IN_PROGRESS') return { variant: 'yellow', text: t(Task.STATUS_IN_PROGRESS) };
		return null;
	};

	const statusChip = getStatusChip();

	return (
		<Card withOutsideShadow className={`${styles.content} ${className ?? ''}`}>
			<Link href={taskPath} className={styles.wrapper}>
				<Flex direction="column" gap="12" flex={1}>
					<Text variant="body3-accent" maxRows={2}>
						{name}
					</Text>
					<Flex align="center" wrap="wrap" gap="8">
						{statusChip && <StatusChip status={statusChip} />}
						<TaskDifficultyChip difficulty={difficulty} />
						{(supportedLanguages ?? []).map((lang) => (
							<Chip key={lang.id} label={lang.name} />
						))}
						{mainCategory && <Chip label={mainCategory} />}
					</Flex>
				</Flex>
			</Link>
		</Card>
	);
};
