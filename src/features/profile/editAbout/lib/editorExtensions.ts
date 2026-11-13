import { textblockTypeInputRule } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextAlign from '@tiptap/extension-text-align';
import { Plugin, TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';
import { createLowlight } from 'lowlight';

function convertSpacesToTabs(code: string, tabSize = 2): string {
	return code
		.split('\n')
		.map((line) => {
			let i = 0;
			while (i < line.length && line[i] === ' ') i++;
			const tabs = '\t'.repeat(Math.floor(i / tabSize));
			const rest = line.slice(i);
			return tabs + rest;
		})
		.join('\n');
}

const languageMap: Record<string, string> = {
	js: 'javascript',
	jsx: 'javascript',
	ts: 'typescript',
	py: 'python',
	rb: 'ruby',
	html: 'html',
	xml: 'html',
	csharp: 'csharp',
	cs: 'csharp',
	cpp: 'cpp',
	kt: 'kotlin',
	rs: 'rust',
	php: 'php',
	java: 'java',
	css: 'css',
	go: 'go',
	swift: 'swift',
	kotlin: 'kotlin',
	rust: 'rust',
};

function createCodeBlockNodeView(styles: Record<string, string>) {
	return ({ node }: Pick<NodeViewProps, 'node'>) => {
		const container = document.createElement('div');
		container.className = styles['code-block-wrapper'];

		const pre = document.createElement('pre');
		pre.className = styles['code-block'];

		const code = document.createElement('code');
		code.classList.add('hljs');

		const rawCode = node.textContent || '';
		let langAttr = (node.attrs.language || 'plaintext').toLowerCase().trim();
		langAttr = languageMap[langAttr] || langAttr;

		code.textContent = rawCode;
		code.classList.add('hljs');
		code.classList.add(`language-${langAttr}`);

		container.appendChild(pre);
		pre.appendChild(code);

		return {
			dom: container,
			contentDOM: code,
		};
	};
}

const lowlight = createLowlight();

function createCustomCodeBlock(styles: Record<string, string>) {
	return CodeBlockLowlight.extend({
		addInputRules() {
			return [
				textblockTypeInputRule({
					find: /^```([a-z0-9+#/\\-]*)?[\s\n]$/i,
					type: this.type,
					getAttributes: (match) => ({
						language: match[1] || 'plaintext',
					}),
				}),
			];
		},

		addNodeView() {
			return createCodeBlockNodeView(styles);
		},
	}).configure({ lowlight });
}

function createPastePlugin(editorInstance: Editor) {
	return new Plugin({
		props: {
			handlePaste(view, event, _slice) {
				const html = event.clipboardData?.getData('text/html');
				if (html) {
					return false;
				}
				const text = event.clipboardData?.getData('text/plain');
				const state = view.state;
				const { $from } = state.selection;
				const parentNodeType = $from.parent.type.name;
				if (parentNodeType === 'codeBlock') {
					return false;
				}
				if (text && text.includes('\n')) {
					event.preventDefault();
					const codeWithTabs = convertSpacesToTabs(text, 2);
					editorInstance.commands.insertContent({
						type: 'codeBlock',
						attrs: { language: 'plaintext' },
						content: [{ type: 'text', text: codeWithTabs }],
					});
					return true;
				}
				return false;
			},
		},
	});
}

function normalizeHtmlContent(htmlContent: string): string {
	if (!htmlContent) return '';

	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);

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
}

export { normalizeHtmlContent, convertSpacesToTabs };

export const createAboutExtensions = (styles: Record<string, string>) => [
	StarterKit.configure({
		codeBlock: false,
		link: false,
		code: {
			HTMLAttributes: {
				class: styles['inline-code'],
			},
		},
		heading: {
			levels: [1, 2, 3, 4, 5, 6],
			HTMLAttributes: {
				class: styles['editor-heading'],
			},
		},
		bulletList: {
			HTMLAttributes: {
				class: styles['bullet-list'],
			},
		},
		orderedList: {
			HTMLAttributes: {
				class: styles['ordered-list'],
			},
		},
		listItem: {
			HTMLAttributes: {
				class: styles['list-item'],
			},
		},
		blockquote: {
			HTMLAttributes: {
				class: styles['blockquote'],
			},
		},
	}),
	createCustomCodeBlock(styles).configure({
		HTMLAttributes: {
			class: styles['code-block'],
		},
		defaultLanguage: 'plaintext',
	}),
	TextAlign.configure({
		types: ['heading', 'paragraph'],
	}),
];

export const registerAboutPaste = (editor: Editor) =>
	editor.registerPlugin(createPastePlugin(editor));

export const handleCodeTab = (editor: Editor, event: KeyboardEvent): boolean => {
	if (!editor.isActive('codeBlock') || event.key !== 'Tab') return false;
	event.preventDefault();
	return editor.commands.command(({ tr, state }) => {
		const { from, to } = state.selection;
		const text = state.doc.textBetween(from, to, '\n');
		const updated = text
			.split('\n')
			.map((line) =>
				event.shiftKey
					? line.startsWith('\t')
						? line.slice(1)
						: line.startsWith('    ')
							? line.slice(4)
							: line
					: '\t' + line,
			)
			.join('\n');
		tr.insertText(updated, from, to);
		tr.setSelection(TextSelection.create(tr.doc, from, to + updated.length - text.length));
		return true;
	});
};
