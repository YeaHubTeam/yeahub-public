'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Specializations, Translation, i18Namespace } from '@/shared/config';
import { BaseFilterItem, BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import {
	DEFAULT_SPECIALIZATION_ID,
	MAX_SHOW_LIMIT_SPECIALIZATIONS,
} from '../../model/constants/specializationConstants';
import { useSpecializations } from '../../model/hooks/useSpecializations';
import { GetSpecializationsListResponse } from '../../model/types/specialization';

interface SpecializationsListFieldProps {
	selectedSpecialization?: number;
	onChangeSpecialization: (specialization: number | undefined, slug?: string) => void;
	initialData?: GetSpecializationsListResponse | null;
}

export const SpecializationsListField = ({
	selectedSpecialization = DEFAULT_SPECIALIZATION_ID,
	onChangeSpecialization,
	initialData,
}: SpecializationsListFieldProps) => {
	const t = useTranslations(i18Namespace.specialization);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const [limit, setLimit] = useState(MAX_SHOW_LIMIT_SPECIALIZATIONS);

	const { data: specializations } = useSpecializations({ limit }, initialData);

	useEffect(() => {
		if (showAll) {
			const total = specializations?.total ?? MAX_SHOW_LIMIT_SPECIALIZATIONS;

			setLimit(total);
		} else {
			setLimit(MAX_SHOW_LIMIT_SPECIALIZATIONS);
		}
	}, [showAll, specializations?.total]);

	const onToggleShowAll = () => {
		setShowAll(!showAll);
	};

	const onChooseSpecialization = (id: number) => {
		const slug = specializations?.data?.find((specialization) => specialization.id === id)?.slug;
		onChangeSpecialization(id, slug);
	};

	const specializationsItems: BaseFilterItem<number>[] | undefined = useMemo(
		() =>
			specializations?.data.map(({ id, title }) => ({
				id,
				title,
				active: selectedSpecialization === id,
			})),
		[specializations, selectedSpecialization],
	);

	if (!specializationsItems) return null;

	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSection
				data={specializationsItems}
				title={t(Specializations.TITLE_MAIN)}
				onClick={onChooseSpecialization}
			/>
			<Button variant="link" onClick={onToggleShowAll}>
				{!showAll ? tCommon(Translation.SHOW_ALL) : tCommon(Translation.HIDE)}
			</Button>
		</Flex>
	);
};
