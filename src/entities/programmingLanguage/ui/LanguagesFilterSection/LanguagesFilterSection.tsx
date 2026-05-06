'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { Tasks, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { useLanguages } from '../../model/hooks/useLanguages';
import { GetLanguagesResponse } from '../../model/types/programmingLanguage';

interface LanguagesFilterSectionProps {
	selectedLangIds: number[];
	onChangeLangIds: (ids: number[]) => void;
	initialData?: GetLanguagesResponse | null;
}

export const LanguagesFilterSection = ({
	selectedLangIds,
	onChangeLangIds,
	initialData,
}: LanguagesFilterSectionProps) => {
	const t = useTranslations(i18Namespace.tasks);
	const { data: languages, loading } = useLanguages(initialData);

	const languageItems = useMemo(
		() =>
			(languages ?? []).map((lang) => ({
				id: lang.id,
				title: lang.name,
				active: selectedLangIds.includes(lang.id),
			})),
		[languages, selectedLangIds],
	);

	const handleLanguageClick = (id: number) => {
		const updated = selectedLangIds.includes(id)
			? selectedLangIds.filter((langId) => langId !== id)
			: [...selectedLangIds, id];
		onChangeLangIds(updated);
	};

	if (!languageItems.length) return null;

	return (
		<BaseFilterSection
			data={languageItems}
			title={t(Tasks.LANGUAGES_TITLE)}
			onClick={handleLanguageClick}
			disabled={loading}
		/>
	);
};
