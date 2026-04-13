'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Task, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Flex } from '@/shared/ui/Flex';

import styles from './TaskCategoryFilter.module.css';

const INITIAL_VISIBLE_COUNT = 4;

interface TaskCategoryFilterProps {
	categories: string[];
	selectedCategory?: string;
	onChangeCategory: (category?: string) => void;
}

export const TaskCategoryFilter = ({
	categories,
	selectedCategory,
	onChangeCategory,
}: TaskCategoryFilterProps) => {
	const t = useTranslations(i18Namespace.task);
	const [showAll, setShowAll] = useState(false);

	if (categories.length === 0) return null;

	const visibleCategories = showAll ? categories : categories.slice(0, INITIAL_VISIBLE_COUNT);

	const preparedData = visibleCategories.map((category) => ({
		id: category,
		title: category,
		active: selectedCategory === category,
	}));

	const onToggleCategory = (id: string) => {
		onChangeCategory(selectedCategory === id ? undefined : id);
	};

	return (
		<Flex direction="column" gap="8">
			<BaseFilterSection
				title={t(Task.CATEGORIES_TITLE)}
				data={preparedData}
				onClick={onToggleCategory}
			/>
			{categories.length > INITIAL_VISIBLE_COUNT && (
				<button className={styles['show-all-btn']} onClick={() => setShowAll((prev) => !prev)}>
					{showAll ? t(Task.CATEGORIES_HIDE) : t(Task.CATEGORIES_SHOW_ALL)}
				</button>
			)}
		</Flex>
	);
};
