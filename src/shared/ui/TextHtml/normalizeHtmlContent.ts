import DOMPurify, { WindowLike } from 'dompurify';
import { JSDOM } from 'jsdom';

export const normalizeHtmlContent = (htmlContent: string): string => {
	if (!htmlContent) return '';

	const jsdom = new JSDOM('');
	const doc = jsdom.window.document;
	const purify = DOMPurify(jsdom.window as unknown as WindowLike);

	const tempDiv = doc.createElement('div');
	tempDiv.innerHTML = purify.sanitize(htmlContent);

	const codeBlocks = tempDiv.querySelectorAll('pre code');

	codeBlocks.forEach((codeElement) => {
		const preElement = codeElement.parentElement;
		if (preElement && preElement.tagName.toLowerCase() === 'pre') {
			const currentClasses = Array.from(codeElement.classList);
			const hasCodeBlockClass = currentClasses.some(
				(cls) => cls.includes('code-block') || cls.includes('TextEditor-module'),
			);

			if (hasCodeBlockClass) {
				codeElement.className = 'hljs';

				const languageClass = currentClasses.find((cls) => cls.startsWith('language-'));
				if (languageClass) {
					codeElement.classList.add(languageClass);
				}
			}

			const preClasses = Array.from(preElement.classList);
			const hasPreCodeBlockClass = preClasses.some(
				(cls) => cls.includes('code-block') || cls.includes('TextEditor-module'),
			);

			if (hasPreCodeBlockClass) {
				preElement.className = '';
			}
		}
	});

	const standaloneCodeBlocks = tempDiv.querySelectorAll('code:not(pre code)');
	standaloneCodeBlocks.forEach((codeElement) => {
		const currentClasses = Array.from(codeElement.classList);
		const hasInlineCodeClass = currentClasses.some(
			(cls) => cls.includes('inline-code') || cls.includes('TextEditor-module'),
		);

		if (hasInlineCodeClass) {
			codeElement.className = '';
		}
	});

	return tempDiv.innerHTML;
};
