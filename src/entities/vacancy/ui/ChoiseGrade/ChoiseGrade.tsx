import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { getUpdatedSingleFilter } from '../../libs/updateFilterValue';
import { GRADE } from '../../model/constants';
import { ChoiseFilterProps } from '../../model/types';

export const ChoiseGrade = ({ selectedFilter, onChangeFilter }: ChoiseFilterProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const onGrade = (id: number) => {
		const newValue = GRADE.find((el) => el.id === id)?.title || '';
		const updates = getUpdatedSingleFilter(newValue, selectedFilter);
		onChangeFilter(updates);
	};

	const preparedData = GRADE.map((item) => ({
		...item,
		active: selectedFilter?.some((selectedItem) => item.title === selectedItem),
	}));

	return (
		<BaseFilterSection
			data={preparedData}
			title={t(Vacancies.GRADE)}
			onClick={onGrade}
			variant="accent"
			colorVariant="purple"
		/>
	);
};
