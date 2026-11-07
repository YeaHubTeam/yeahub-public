'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

import styles from './Checkbox.module.css';

// React Checkbox: тот же native input и CSS; отдельный label сохраняет ссылки интерактивными.
export const Checkbox = ({
	id,
	label,
	...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { id: string; label: ReactNode }) => (
	<div className={styles.wrapper}>
		<input {...props} id={id} type="checkbox" className={styles.checkbox} />
		<label htmlFor={id} className={styles.label}>
			{label}
		</label>
	</div>
);
