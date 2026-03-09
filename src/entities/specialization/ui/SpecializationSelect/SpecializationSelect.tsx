'use client';

import { ComponentProps, useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Specializations, i18Namespace } from '@/shared/config';
import { Dropdown, Option } from '@/shared/ui/Dropdown';
import { SelectWithChips } from '@/shared/ui/SelectWithChips';

import { getSpecializations } from '../../api/getSpecializations';
import type { Specialization } from '../../model/types/specialization';

export type SpecializationSelectProps = Omit<
	ComponentProps<typeof Dropdown>,
	'options' | 'type' | 'value' | 'onChange' | 'children'
> & {
	value: number | number[];
	onChange: (value: number[] | number) => void;
	hasMultiple?: boolean;
	disabled?: boolean;
};

export const SpecializationSelect = ({
	onChange,
	value,
	hasMultiple,
	disabled,
	prefix,
	className,
}: SpecializationSelectProps) => {
	const t = useTranslations(i18Namespace.specialization);
	const [specializationsData, setSpecializationsData] = useState<{ data: Specialization[] } | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>(
		Array.isArray(value) ? value : value !== undefined ? [value] : [],
	);

	useEffect(() => {
		const loadSpecializations = async () => {
			setIsLoading(true);
			try {
				const result = await getSpecializations({ limit: 100 });
				setSpecializationsData(result);
			} finally {
				setIsLoading(false);
			}
		};

		void loadSpecializations();
	}, []);

	const handleChange = (newValue: string | undefined) => {
		if (disabled || !newValue) return;
		const numValue = +newValue;

		if (hasMultiple) {
			const updates = [...selectedSpecializations, numValue];
			setSelectedSpecializations(updates);
			onChange(updates);
		} else {
			setSelectedSpecializations([numValue]);
			onChange(numValue);
		}
	};

	const handleDeleteSpecialization = (id: number) => () => {
		if (disabled) return;
		const updates = selectedSpecializations.filter((specializationId) => specializationId !== id);
		setSelectedSpecializations(updates);
		onChange(updates);
	};

	const options = useMemo(() => {
		const data = specializationsData?.data || [];

		if (hasMultiple) {
			return data
				.map((specialization) => ({
					label: specialization.title,
					value: specialization.id.toString(),
					limit: 100,
				}))
				.filter((specialization) => !selectedSpecializations?.includes(+specialization.value));
		} else {
			return data.map((specialization) => ({
				label: specialization.title,
				value: specialization.id.toString(),
				limit: 100,
			}));
		}
	}, [selectedSpecializations, specializationsData, hasMultiple]);

	const specializationsDictionary = useMemo(() => {
		const emptySpecialization: Specialization = {
			id: 0,
			title: t(Specializations.SELECT_CHOOSE),
			slug: '',
			imageSrc: null,
			description: '',
		};

		const data = specializationsData?.data || [];
		return data.reduce(
			(acc, specialization) => {
				acc[specialization.id] = specialization;
				return acc;
			},
			{ 0: emptySpecialization } as Record<number, Specialization>,
		);
	}, [specializationsData, t]);

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="h-10 bg-gray-200 rounded-lg"></div>
			</div>
		);
	}

	if (!hasMultiple) {
		return (
			<Dropdown
				size="S"
				label={options.length ? t(Specializations.SELECT_CHOOSE) : t(Specializations.SELECT_EMPTY)}
				disabled={disabled}
				value={specializationsDictionary[Array.isArray(value) ? value[0] : value]?.title ?? ''}
				onSelect={(val) => handleChange(String(val))}
				prefix={prefix}
				className={className}
			>
				{options.map((option) => (
					<Option value={option.value} label={option.label} key={option.value} />
				))}
			</Dropdown>
		);
	}

	return (
		<SelectWithChips
			size="S"
			title={t(Specializations.SELECT_SELECTED)}
			options={options}
			onChange={handleChange}
			selectedItems={selectedSpecializations}
			handleDeleteItem={handleDeleteSpecialization}
			itemsDictionary={specializationsDictionary}
			placeholder={
				options.length ? t(Specializations.SELECT_CHOOSE) : t(Specializations.SELECT_EMPTY)
			}
			disabled={disabled}
		/>
	);
};
