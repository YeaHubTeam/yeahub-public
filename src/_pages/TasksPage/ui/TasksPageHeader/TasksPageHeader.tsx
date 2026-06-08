import React from 'react';

import { useTranslations } from 'next-intl';

import { ProgrammingLanguage } from '@/entities/programmingLanguage';
import { TaskCategory } from '@/entities/tasks';
import { Tasks as TasksTranslations, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';
import styles from './TasksPageHeader.module.css';

interface TasksPageHeaderProps {
	categories: TaskCategory[];
	languages: ProgrammingLanguage[];
}

export const TasksPageHeader = ({ categories, languages }: TasksPageHeaderProps) => {
	const t = useTranslations(i18Namespace.tasks);

	const title = t(TasksTranslations.TITLE_SHORT);

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
				<FiltersDrawer>
					<TasksFilterPanel categories={categories} languages={languages} />
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
