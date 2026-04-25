'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Tasks, Translation, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { taskCategories } from '../../model/constants/task';
import { TaskCategoryCode } from '../../model/types/task';

const MAX_VISIBLE = 4;

interface CategoriesFilterSectionProps {
	selectedCategory?: TaskCategoryCode;
	onChangeCategory: (value?: TaskCategoryCode) => void;
}

export const CategoriesFilterSection = ({
	selectedCategory,
	onChangeCategory,
}: CategoriesFilterSectionProps) => {
	const t = useTranslations(i18Namespace.tasks);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const allCategories = Object.keys(taskCategories) as TaskCategoryCode[];
	const visibleCategories = showAll ? allCategories : allCategories.slice(0, MAX_VISIBLE);

	const items = visibleCategories.map((code) => ({
		id: code,
		title: t(taskCategories[code]),
		active: selectedCategory === code,
	}));

	const handleClick = (id: TaskCategoryCode) => {
		onChangeCategory(selectedCategory === id ? undefined : id);
	};

	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSection title={t(Tasks.CATEGORY_TITLE)} data={items} onClick={handleClick} />
			<Button variant="link" onClick={() => setShowAll((prev) => !prev)}>
				{!showAll ? tCommon(Translation.SHOW_ALL) : tCommon(Translation.HIDE)}
			</Button>
		</Flex>
	);
};
