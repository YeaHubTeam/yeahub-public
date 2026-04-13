import DOMPurify from 'dompurify';
import { toHtml } from 'hast-util-to-html';
import { common, createLowlight } from 'lowlight';

import { determineLanguage } from './determineLanguage';
import { normalizeHtmlContent } from './normalizeHtmlContent';

const lowlight = createLowlight(common);

export interface ProcessedCodeBlock {
	id: string;
	content: string;
	language: string;
}

export interface ProcessHtmlClientResult {
	processedHtml: string;
	codeBlocks: ProcessedCodeBlock[];
}

export function processHtmlContentClient(html: string): ProcessHtmlClientResult {
	const normalizedHtml = normalizeHtmlContent(html);

	const sanitizedHtml = DOMPurify.sanitize(normalizedHtml, {
		ADD_TAGS: ['pre', 'code'],
		ADD_ATTR: ['class', 'data-code-id'],
		FORBID_ATTR: ['style'],
	});

	const parser = new DOMParser();
	const doc = parser.parseFromString(sanitizedHtml, 'text/html');
	const preElements = doc.querySelectorAll('pre');
	const codeBlocks: ProcessedCodeBlock[] = [];

	preElements.forEach((pre, index) => {
		const code = pre.querySelector('code');
		if (!code) return;

		const codeContent = code.textContent || '';
		const initialLanguage = code.className.replace('language-', '') || 'plaintext';
		const language = determineLanguage(codeContent, initialLanguage, lowlight);
		const codeId = `code-block-${index}`;

		try {
			const result = lowlight.highlight(language, codeContent);
			code.innerHTML = toHtml(result);
			pre.classList.add('hljs');
			code.className = `hljs language-${language}`;

			const wrapper = doc.createElement('div');
			wrapper.className = 'code-block-wrapper';
			wrapper.setAttribute('data-code-id', codeId);

			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);

			codeBlocks.push({
				id: codeId,
				content: codeContent,
				language,
			});
		} catch (_e) {
			const result = lowlight.highlight('plaintext', codeContent);
			code.innerHTML = toHtml(result);
			code.className = 'hljs language-plaintext';

			const wrapper = doc.createElement('div');
			wrapper.className = 'code-block-wrapper code-wrapper-container';
			wrapper.setAttribute('data-code-id', codeId);

			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);

			codeBlocks.push({
				id: codeId,
				content: codeContent,
				language: 'plaintext',
			});
		}
	});

	return {
		processedHtml: doc.body.innerHTML,
		codeBlocks,
	};
}
