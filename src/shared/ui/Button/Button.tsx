import React, { JSX, forwardRef } from 'react';

import classnames from 'classnames';

import styles from './Button.module.css';
import { getStylePrefix, getTagName } from './helpers';
import { ButtonProps } from './types';

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	(
		{
			size = 'medium',
			variant = 'primary',
			className = '',
			fullWidth = false,
			destructive = false,
			children,
			preffix,
			suffix,
			badge,
			dataTestId = 'Button',
			...props
		},
		ref,
	): JSX.Element => {
		const tagName = getTagName(variant, !!props.href);
		const stylePrefix = getStylePrefix(variant);

		const Component = tagName as React.ElementType;

		return (
			<Component
				ref={ref}
				className={classnames(
					styles[stylePrefix],
					styles[`${stylePrefix}-${size}`],
					fullWidth && styles[`${stylePrefix}-full`],
					destructive && stylePrefix === 'a'
						? styles['a-link-destructive']
						: styles[`${stylePrefix}-${variant}`],
					className,
					tagName === 'a' && props.disabled ? styles['disabled'] : '',
				)}
				{...props}
				data-testid={dataTestId}
			>
				{preffix}
				{children}
				{suffix}
				{badge && badge !== '0' ? <div className={styles['button-badge']}>{badge}</div> : null}
			</Component>
		);
	},
);

Button.displayName = 'Button';
