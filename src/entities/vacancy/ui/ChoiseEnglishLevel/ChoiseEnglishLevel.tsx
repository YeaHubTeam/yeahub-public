import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { getUpdatedMultipleFilter } from '../../libs/updateFilterValue';
import { ENGLISH_LEVEL } from '../../model/constants';
import { ChoiseFilterProps } from '../../model/types';

export const ChoiseEnglishLevel = ({ selectedFilter, onChangeFilter }: ChoiseFilterProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const onEnglishLevel = (id: number) => {
		const newValue = ENGLISH_LEVEL.find((el) => el.id === id)?.value || [];
		const updates = getUpdatedMultipleFilter(newValue, selectedFilter);
		onChangeFilter(updates);
	};

	const preparedData = ENGLISH_LEVEL.map((item) => ({
		...item,
		active: selectedFilter?.some((selectedItem) => item.value.includes(selectedItem)),
	}));

	return (
		<BaseFilterSection
			data={preparedData}
			title={t(Vacancies.ENGLISH_LEVEL)}
			onClick={onEnglishLevel}
			variant="accent"
			colorVariant="purple"
		/>
	);
};
