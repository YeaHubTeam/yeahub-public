'use client';

import { ComponentProps, useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Companies, i18Namespace } from '@/shared/config';
import { Dropdown, Option } from '@/shared/ui/Dropdown';
import { SelectWithChips } from '@/shared/ui/SelectWithChips';

import { useCompanies } from '../../model/hooks/useCompanies';
import type { Company } from '../../model/types/company';

export type CompaniesSelectProps = Omit<
	ComponentProps<typeof Dropdown>,
	'options' | 'type' | 'value' | 'onChange' | 'children'
> & {
	value?: string | string[];
	onChange: (value?: string[] | string) => void;
	hasMultiple?: boolean;
	disabled?: boolean;
};

export const CompaniesSelect = ({
	onChange,
	value,
	hasMultiple,
	disabled,
	prefix,
	className,
}: CompaniesSelectProps) => {
	const [searchValue, setSearchValue] = useState('');
	const t = useTranslations(i18Namespace.company);
	const { data: companies, loading } = useCompanies({ limit: 100 });

	const selectedCompanies = useMemo(
		() => (Array.isArray(value) ? value : value ? [value] : []),
		[value],
	);

	const options = useMemo(() => {
		const data = companies?.data ?? [];

		return data
			.map((company) => ({
				label: company.title,
				value: company.id,
			}))
			.filter((company) => !hasMultiple || !selectedCompanies.includes(company.value));
	}, [companies, hasMultiple, selectedCompanies]);

	const selectedValue = Array.isArray(value) ? value[0] : value;

	useEffect(() => {
		if (!selectedValue) {
			setSearchValue('');
			return;
		}

		const selectedCompany = options.find((option) => option.value === selectedValue);

		if (selectedCompany) {
			setSearchValue(selectedCompany.label);
		}
	}, [selectedValue, options]);

	const companiesDictionary = useMemo(() => {
		const data = companies?.data ?? [];

		return data.reduce(
			(acc, company) => {
				acc[company.id] = company;
				return acc;
			},
			{} as Record<string, Company>,
		);
	}, [companies]);

	const handleChange = (newValue: string | undefined) => {
		if (disabled || !newValue) return;

		if (hasMultiple) {
			onChange([...selectedCompanies, newValue]);
			return;
		}

		onChange(newValue);
	};

	const handleDeleteCompany = (id: string) => () => {
		if (disabled) return;

		onChange(selectedCompanies.filter((companyId) => companyId !== id));
	};

	if (loading) {
		return (
			<div className="animate-pulse">
				<div className="h-10 bg-gray-200 rounded-lg" />
			</div>
		);
	}

	if (!hasMultiple) {
		return (
			<Dropdown
				isInput
				size="S"
				label={t(Companies.SELECT_CHOOSE)}
				disabled={disabled}
				inputValue={searchValue}
				onChangeValue={setSearchValue}
				onChangeFilterValue={() => {
					setSearchValue('');
					onChange(undefined);
				}}
				onSelect={(val) => {
					const selected = options.find((option) => option.value === val);

					onChange(String(val));
					setSearchValue(selected?.label ?? '');
				}}
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
			title={t(Companies.SELECT_SELECTED)}
			options={options}
			onChange={handleChange}
			selectedItems={selectedCompanies}
			handleDeleteItem={handleDeleteCompany}
			itemsDictionary={companiesDictionary}
			placeholder={t(Companies.SELECT_CHOOSE)}
			disabled={disabled}
		/>
	);
};
