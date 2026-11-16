import type { KeyboardEvent } from 'react';

import classNames from 'classnames';

import styles from './Option.module.css';

export interface OptionProps {
	value: string | number;
	label: string;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	isSelected?: boolean;
	multiple?: boolean;
	onChange?: () => void;
}

export const Option = ({
	label,
	onClick,
	disabled = false,
	className,
	isSelected = false,
}: OptionProps) => {
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		if (!event.repeat) onClick?.();
	};
	return (
		<div
			className={classNames(styles['dropdown-option'], className, {
				[styles.disabled]: disabled,
				[styles.selected]: isSelected,
			})}
			role="option"
			aria-selected={isSelected}
			aria-disabled={disabled}
			onClick={!disabled ? onClick : undefined}
			onKeyDown={!disabled ? handleKeyDown : undefined}
			tabIndex={disabled ? -1 : 0}
		>
			{label}
		</div>
	);
};
