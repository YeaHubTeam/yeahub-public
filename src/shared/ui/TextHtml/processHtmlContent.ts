import DOMPurify from 'dompurify';
import { toHtml } from 'hast-util-to-html';
import { JSDOM } from 'jsdom';
import { common, createLowlight } from 'lowlight';

import { determineLanguage } from './determineLanguage';
import { normalizeHtmlContent } from './normalizeHtmlContent';

const lowlight = createLowlight(common);

export interface ProcessedCodeBlock {
	id: string;
	content: string;
	language: string;
}

export interface ProcessHtmlResult {
	processedHtml: string;
	codeBlocks: ProcessedCodeBlock[];
}

export const processHtmlContent = (html: string): ProcessHtmlResult => {
	const window = new JSDOM('').window;
	const DOMPurifyServer = DOMPurify(window);

	// Keep the existing style ban. Reconstruct only a canonical, allowlisted alignment
	// after DOMPurify has removed the original style and all other forbidden attributes.
	const alignmentTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
	const alignments = new Set(['left', 'center', 'right', 'justify']);
	const verifiedAlignments = new WeakMap<Element, string>();
	DOMPurifyServer.addHook('uponSanitizeAttribute', (node, attribute) => {
		if (
			attribute.attrName !== 'style' ||
			node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
			!alignmentTags.has(node.localName)
		)
			return;
		// The installed CSSOM parser drops !important for text-align. Require one exact
		// source declaration too; reject priorities, escaped values and ambiguous duplicates.
		const declarations = attribute.attrValue
			.split(';')
			.filter((value) => /^\s*text-align\s*:/i.test(value));
		if (
			declarations.length !== 1 ||
			!/^\s*text-align\s*:\s*(left|center|right|justify)\s*$/i.test(declarations[0])
		)
			return;
		// Parse CSS on a detached element, without assigning untrusted HTML or applying styles.
		const style = window.document.createElement('span').style;
		style.cssText = attribute.attrValue;
		const alignment = style.getPropertyValue('text-align').trim().toLowerCase();
		if (alignments.has(alignment) && style.getPropertyPriority('text-align') === '')
			verifiedAlignments.set(node, alignment);
	});
	DOMPurifyServer.addHook('afterSanitizeAttributes', (node) => {
		const alignment = verifiedAlignments.get(node);
		if (alignment) node.setAttribute('style', `text-align: ${alignment}`);
	});

	const normalizedHtml = normalizeHtmlContent(html);

	const sanitizedHtml = DOMPurifyServer.sanitize(normalizedHtml, {
		ADD_TAGS: ['pre', 'code'],
		ADD_ATTR: ['class', 'data-code-id'],
		FORBID_ATTR: ['style'],
	});

	const doc = new JSDOM(sanitizedHtml).window.document;
	const preElements = doc.querySelectorAll('pre');
	const codeBlocks: ProcessedCodeBlock[] = [];

	preElements.forEach((pre, index) => {
		const code = pre.querySelector('code');
		if (code) {
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
		}
	});

	return {
		processedHtml: doc.body.innerHTML,
		codeBlocks,
	};
};
