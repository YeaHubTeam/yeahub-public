'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config/i18n/i18n';
import { Specializations, Translation } from '@/shared/config/i18n/i18nTranslations';
import { BaseFilterItem, BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import {
	DEFAULT_SPECIALIZATION_ID,
	MAX_SHOW_LIMIT_SPECIALIZATIONS,
} from '../../model/constants/specializationConstants';
import { GetSpecializationsListResponse } from '../../model/types/specialization';

interface SpecializationsListFieldProps {
	selectedSpecialization?: number;
	onChangeSpecialization: (specialization: number | undefined) => void;
}

export const SpecializationsListField = ({
	selectedSpecialization = DEFAULT_SPECIALIZATION_ID,
	onChangeSpecialization,
}: SpecializationsListFieldProps) => {
	const t = useTranslations(i18Namespace.specialization);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const [limit, setLimit] = useState(MAX_SHOW_LIMIT_SPECIALIZATIONS);
	const [specializations, setSpecializations] = useState<GetSpecializationsListResponse | null>(
		null,
	);

	const getSpecializations = async () => {
		const response = (await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}specializations?limit=${limit}`,
		).then((res) => res.json())) as GetSpecializationsListResponse;
		setSpecializations(response);
	};

	useEffect(() => {
		void getSpecializations();
	}, [limit]);

	const onToggleShowAll = () => {
		setShowAll(!showAll);
	};

	useEffect(() => {
		if (showAll) {
			setLimit((limit) => specializations?.total ?? limit);
		} else {
			setLimit(MAX_SHOW_LIMIT_SPECIALIZATIONS);
		}
	}, [limit, specializations?.total, showAll]);

	const onChooseSpecialization = (id: number) => {
		onChangeSpecialization(id);
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
