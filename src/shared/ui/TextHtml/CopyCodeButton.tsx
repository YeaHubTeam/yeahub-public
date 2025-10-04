'use client';

import { useState } from 'react';

import styles from './TextHtml.module.css';

interface CopyCodeButtonProps {
	code: string;
	disabled?: boolean;
}

export const CopyCodeButton = ({ code, disabled = false }: CopyCodeButtonProps) => {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = () => async () => {
		if (disabled) return;

		try {
			await navigator.clipboard.writeText(code);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 2000);
		} catch (error) {
			console.error('Failed to copy code:', error);
		}
	};

	return (
		<button
			className={`${styles['code-block-copy']} ${isCopied ? styles.copied : ''}`}
			onClick={handleCopy}
			disabled={disabled}
			type="button"
			aria-label={isCopied ? 'Скопировано' : 'Копировать код'}
		>
			<div className={styles['copy-button-content']}>
				<svg
					className={styles['copy-icon']}
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
				<svg
					className={styles['check-icon']}
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</div>
		</button>
	);
};
