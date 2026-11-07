'use client';

import { InputHTMLAttributes, ReactNode, useState } from 'react';

import Eye from '@/shared/assets/icons/eye.svg';
import EyeClosed from '@/shared/assets/icons/eyeClosed.svg';
import { Text } from '@/shared/ui/Text';

import styles from './AuthField.module.css';

export interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	id: string;
	label: string;
	error?: string;
	suffix?: ReactNode;
}

// JSX/размеры перенесены из React Input + FormControl. RHF заменён controlled props.
export const AuthField = ({
	id,
	label,
	error,
	suffix,
	disabled,
	className = '',
	...props
}: AuthFieldProps) => (
	<div className={`${styles.field} ${className}`}>
		<label htmlFor={id} id={`${id}-label`}>
			<Text variant="body2" color="black-700" className={styles.label}>
				{label}
			</Text>
		</label>
		<div
			className={`${styles.wrapper} ${error ? styles.invalid : ''} ${disabled ? styles.disabled : ''}`}
		>
			<input
				{...props}
				id={id}
				className={styles.input}
				disabled={disabled}
				aria-labelledby={`${id}-label`}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : props['aria-describedby']}
			/>
			{suffix && <span className={styles.suffix}>{suffix}</span>}
		</div>
		{error && (
			<div id={`${id}-error`} role="alert">
				<Text variant="body1" color="red-700" className={styles.error}>
					{error}
				</Text>
			</div>
		)}
	</div>
);

export const AuthPasswordField = ({
	showLabel,
	hideLabel,
	...props
}: Omit<AuthFieldProps, 'type' | 'suffix'> & { showLabel: string; hideLabel: string }) => {
	const [visible, setVisible] = useState(false);
	const EyeIcon = visible ? EyeClosed : Eye;
	return (
		<AuthField
			{...props}
			type={visible ? 'text' : 'password'}
			suffix={
				<button
					type="button"
					className={styles.eye}
					disabled={props.disabled}
					aria-label={visible ? hideLabel : showLabel}
					aria-pressed={visible}
					onClick={() => setVisible(!visible)}
				>
					<EyeIcon width={24} height={24} aria-hidden="true" />
				</button>
			}
		/>
	);
};
