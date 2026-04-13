import type { Task } from '@/entities/task';
import { TaskDescription } from '@/entities/task';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { TaskCodeEditor } from '../TaskCodeEditor/TaskCodeEditor';
import styles from './TaskPage.module.css';

interface TaskPageProps {
	task: Task;
}

export const TaskPage = ({ task }: TaskPageProps) => {
	return (
		<Flex gap="20" align="start" className={styles.layout}>
			<Card className={styles.description}>
				<TaskDescription task={task} />
			</Card>

			<Card className={styles.editor}>
				<TaskCodeEditor task={task} />
			</Card>
		</Flex>
	);
};
