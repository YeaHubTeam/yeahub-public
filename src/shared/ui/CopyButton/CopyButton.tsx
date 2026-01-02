'use client';

import { forwardRef } from 'react';

import classNames from 'classnames';

import { useCopy } from '@/shared/libs/fp';

import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import styles from './CopyButton.module.css';
import { CopyButtonProps } from './types';

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
	({ text, ...props }, ref) => {
		const { copied, copy } = useCopy();

		const handleClick = () => {
			void copy(String(text)); // Добавляем void
		};

		return (
			<IconButton
				ref={ref}
				variant="tertiary"
				aria-label="copy"
				onClick={handleClick}
				icon={<Icon icon={copied ? 'check' : 'copy'} size={20} />}
				className={classNames({ [styles.reset]: !copied })}
				{...props}
			/>
		);
	},
);

CopyButton.displayName = 'CopyButton';
