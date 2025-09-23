'use client';

import { JSX, forwardRef } from 'react';

import classnames from 'classnames';

import { ButtonProps } from './';
import styles from './IconButton.module.css';

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { isActive?: boolean }>(
	(
		{
			dataTestId,
			variant = 'primary',
			size = 'medium',
			form = 'square',
			destructive = false,
			className,
			icon,
			onClick,
			isActive = false,
			...otherProps
		},
		ref,
	): JSX.Element => {
		return (
			<button
				data-testid={dataTestId}
				ref={ref}
				className={classnames(
					styles['icon-button'],
					styles[`icon-button-${form}`],
					styles[`icon-button-${size}`],
					destructive ? styles[`icon-button-destructive`] : styles[`icon-button-${variant}`],
					className,
					{ [styles[`icon-button-is-active`]]: isActive },
				)}
				onClick={onClick}
				{...otherProps}
			>
				{icon}
			</button>
		);
	},
);

IconButton.displayName = 'IconButton';
