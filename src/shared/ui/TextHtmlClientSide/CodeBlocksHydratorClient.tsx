'use client';

import { useEffect } from 'react';

import styles from './TextHtmlClientSide.module.css';
import type { ProcessedCodeBlock } from './processHtmlContentClient';

interface CodeBlocksHydratorClientProps {
	codeBlocks: ProcessedCodeBlock[];
	containerId: string;
}

export const CodeBlocksHydratorClient = ({
	codeBlocks,
	containerId,
}: CodeBlocksHydratorClientProps) => {
	useEffect(() => {
		codeBlocks.forEach((block) => {
			const wrapper = document.querySelector(
				`#${CSS.escape(containerId)} [data-code-id="${block.id}"]`,
			);

			if (!(wrapper instanceof HTMLElement) || wrapper.querySelector('[data-copy-button]')) return;

			const button = document.createElement('button');
			button.className = styles['code-block-copy'];
			button.setAttribute('data-copy-button', block.id);
			button.type = 'button';
			button.setAttribute('aria-label', 'Копировать код');

			button.innerHTML = `
				<div class="${styles['copy-button-content']}">
					<svg class="${styles['copy-icon']}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
					</svg>
					<svg class="${styles['check-icon']}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				</div>
			`;

			button.onclick = () => {
				navigator.clipboard
					.writeText(block.content)
					.then(() => {
						button.classList.add(styles.copied);
						setTimeout(() => {
							button.classList.remove(styles.copied);
						}, 2000);
					})
					.catch(() => {
						// может быть недоступен
					});
			};

			wrapper.appendChild(button);
		});
	}, [codeBlocks, containerId]);

	return null;
};
