import { Task } from '@/entities/tasks';
import { BackButton } from '@/shared/ui/BackButton';
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
		categories,
		name,
		supportedLanguages,
		taskStructures,
		companies,
	} = task;

	return (
		<>
			<Flex>
				<BackButton />
			</Flex>
			<Card withOutsideShadow className={styles.page} contentClassName={styles['content-wrapper']}>
				<Flex gap="20" direction={'row'} className={styles.content}>
					<TaskDescription
						description={description}
						difficulty={difficulty}
						categories={categories}
						name={name}
						supportedLanguages={supportedLanguages}
						companies={companies}
					/>
					<TaskEditor supportedLanguages={supportedLanguages} taskStructures={taskStructures} />
				</Flex>
			</Card>
		</>
	);
};
