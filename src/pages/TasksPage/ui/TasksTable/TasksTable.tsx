import type { TaskListItem } from '@/entities/task';
import { TaskCard } from '@/entities/task';

import styles from './TasksTable.module.css';

interface TasksTableProps {
	tasks: TaskListItem[];
}

export const TasksTable = ({ tasks }: TasksTableProps) => {
	return (
		<div className={styles.list}>
			{tasks.map((task) => (
				<TaskCard key={task.id} task={task} />
			))}
		</div>
	);
};
