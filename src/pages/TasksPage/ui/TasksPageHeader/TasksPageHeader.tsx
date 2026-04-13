import { useTranslations } from 'next-intl';

import { Task, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TasksFiltersPanel } from '../TasksFiltersPanel/TasksFiltersPanel';
import styles from './TasksPageHeader.module.css';

interface TasksPageHeaderProps {
	categories: string[];
	languages: { id: number; name: string }[];
}

export const TasksPageHeader = ({ categories, languages }: TasksPageHeaderProps) => {
	const t = useTranslations(i18Namespace.task);

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{t(Task.TITLE_SHORT)}
				</Text>
				<FiltersDrawer>
					<TasksFiltersPanel categories={categories} languages={languages} />
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
