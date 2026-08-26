import React from 'react';

import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './ListPageWrapperHeader.module.css';

export interface ListPageWrapperHeaderProps {
	title: string;
	filterPanel: React.ReactNode;
}

export const ListPageWrapperHeader = ({ filterPanel, title }: ListPageWrapperHeaderProps) => {
	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<Text variant="body6" isMainTitle maxRows={1}>
					{title}
				</Text>
				<FiltersDrawer>{filterPanel}</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
