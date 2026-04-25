import React from 'react';

import { useTranslations } from 'next-intl';

import { Tasks as TasksTranslations, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';
import styles from './TasksPageHeader.module.css';

export const TasksPageHeader = () => {
	const t = useTranslations(i18Namespace.tasks);

	const title = t(TasksTranslations.TITLE_SHORT);

	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
				<FiltersDrawer>
					<TasksFilterPanel />
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
