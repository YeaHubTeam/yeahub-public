'use client';

import { useTranslations } from 'next-intl';

import { Task, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

interface TaskLanguagesFilterProps {
	languages: { id: number; name: string }[];
	selectedLangIds?: number[];
	onChangeLangIds: (langIds?: number[]) => void;
}

export const TaskLanguagesFilter = ({
	languages,
	selectedLangIds,
	onChangeLangIds,
}: TaskLanguagesFilterProps) => {
	const t = useTranslations(i18Namespace.task);

	const selectedIds = selectedLangIds || [];

	const preparedData = languages.map((lang) => ({
		id: lang.id,
		title: lang.name,
		active: selectedIds.includes(lang.id),
	}));

	const onToggleLanguage = (langId: number) => {
		const isSelected = selectedIds.includes(langId);
		const updatedLangIds = isSelected
			? selectedIds.filter((id) => id !== langId)
			: [...selectedIds, langId];
		onChangeLangIds(updatedLangIds.length > 0 ? updatedLangIds : undefined);
	};

	return (
		<BaseFilterSection
			title={t(Task.LANGUAGES_TITLE)}
			data={preparedData}
			onClick={onToggleLanguage}
		/>
	);
};
