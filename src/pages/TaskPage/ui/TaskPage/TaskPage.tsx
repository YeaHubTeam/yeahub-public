import { Task } from '@/entities/tasks';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TaskDescription } from '@/widgets/task/TaskDescription';
import { TaskEditor } from '@/widgets/task/TaskEditor';

import styles from './TaskPage.module.css';

interface TaskPageProps {
	task: Task;
}

export const TaskPage = ({ task }: TaskPageProps) => {
	if (!task) {
		return null;
	}

	const {
		description,
		difficulty,
		mainCategory,
		name,
		supportedLanguages,
		taskStructures,
		companies,
	} = task;

	return (
		<Card withOutsideShadow className={styles.page} contentClassName={styles['content-wrapper']}>
			<Flex gap="20" direction={'row'} className={styles.content}>
				<TaskDescription
					description={description}
					difficulty={difficulty}
					mainCategory={mainCategory}
					name={name}
					supportedLanguages={supportedLanguages}
					companies={companies}
				/>
				<TaskEditor supportedLanguages={supportedLanguages} taskStructures={taskStructures} />
			</Flex>
		</Card>
	);
};
