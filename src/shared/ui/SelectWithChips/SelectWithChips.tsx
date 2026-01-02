'use client';

import Image from 'next/image';

import { Chip } from '@/shared/ui/Chip';
import { Dropdown, Option } from '@/shared/ui/Dropdown';
import { Text } from '@/shared/ui/Text';

import styles from './SelectWithChips.module.css';
import { selectWithChipsTestIds } from './constants';

type SelectWithChipsProps<T, U> = Omit<
	React.ComponentProps<typeof Dropdown>,
	'options' | 'type' | 'value' | 'onChange' | 'children'
> & {
	title?: string;
	placeholder?: string;
	prefix?: string;
	itemsDictionary?: Record<number | string, T>;
	options: { label: string; value: string }[];
	selectedItems?: U[];
	disabled?: boolean;
	handleDeleteItem: (id: U) => () => void;
	onChange: (value?: string) => void;
	isInput?: boolean;
	inputValue?: string;
	onChangeValue?: (value: string) => void;
	dataTestId?: string;
};

export const SelectWithChips = <
	T extends { id: number | string; title: string; imageSrc?: string | null },
	U extends number | string,
>({
	title,
	options,
	onChange,
	placeholder,
	selectedItems,
	handleDeleteItem,
	itemsDictionary,
	disabled,
	inputValue,
	isInput,
	onChangeValue,
	dataTestId = selectWithChipsTestIds.selectWithChips,
}: SelectWithChipsProps<T, U>) => {
	return (
		<div data-testid={dataTestId} className={styles.wrapper}>
			<Dropdown
				isInput={isInput}
				inputValue={inputValue}
				onChangeValue={onChangeValue}
				label={placeholder}
				disabled={disabled}
				onSelect={(val) => onChange(String(val))}
			>
				{options.map((option) => (
					<Option value={option.value} label={option.label} key={option.label} />
				))}
			</Dropdown>
			{!!selectedItems?.length && (
				<>
					<Text variant="body3-accent">{title}</Text>
					<div className={styles.selection}>
						{selectedItems.map((id) => {
							const item = itemsDictionary?.[id];

							return (
								<Chip
									key={id}
									prefix={
										item?.imageSrc ? (
											<Image
												src={item.imageSrc}
												alt={item.title}
												width={24}
												height={24}
												style={{ borderRadius: '4px' }}
											/>
										) : undefined
									}
									label={item?.title}
									theme="primary"
									onDelete={handleDeleteItem(id)}
									disabled={disabled}
									active
									data-testid="chip"
								/>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
};
