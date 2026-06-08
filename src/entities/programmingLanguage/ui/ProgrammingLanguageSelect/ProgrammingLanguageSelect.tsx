'use client';

import { ComponentProps, useMemo } from 'react';

import { Dropdown, Option } from '@/shared/ui/Dropdown';

import { ProgrammingLanguage } from '../../model/types/programmingLanguage';

type ProgrammingLanguageSelectProps = Omit<
	ComponentProps<typeof Dropdown>,
	'options' | 'type' | 'value' | 'onChange' | 'children'
> & {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	supportedLanguages: ProgrammingLanguage[];
	width?: number;
};

export const ProgrammingLanguageSelect = ({
	onChange,
	value,
	disabled,
	supportedLanguages,
	width,
}: ProgrammingLanguageSelectProps) => {
	const languages = useMemo(
		() =>
			supportedLanguages.map((l) => ({
				id: String(l.id),
				title: l.name,
			})),
		[supportedLanguages],
	);

	const handleChangeLanguage = (newValue: string | undefined) => {
		if (disabled || !newValue) return;
		const strValue = newValue;
		onChange(strValue);
	};

	const options = useMemo(() => {
		return languages.map((language) => ({
			label: language.title,
			value: language.id,
			limit: 100,
		}));
	}, [languages]);

	const selectedTitle = languages.find((l) => l.id === value)?.title ?? '';

	return (
		<>
			<Dropdown
				width={width}
				disabled={disabled}
				value={selectedTitle ?? ''}
				onSelect={(val) => handleChangeLanguage(String(val))}
			>
				{options.map((option) => (
					<Option value={option.value} label={option.label} key={option.label} />
				))}
			</Dropdown>
		</>
	);
};
