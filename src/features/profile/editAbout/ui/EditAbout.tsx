'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { DOMSerializer } from '@tiptap/pm/model';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import classNames from 'classnames';
import 'highlight.js/styles/atom-one-dark.css';
import { useTranslations } from 'next-intl';
import { useController, useFormContext } from 'react-hook-form';

import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import {
	convertSpacesToTabs,
	createAboutExtensions,
	handleCodeTab,
	normalizeHtmlContent,
	registerAboutPaste,
} from '../lib/editorExtensions';
import styles from './EditAbout.module.css';

export const EditAbout = () => {
	const t = useTranslations(i18Namespace.profile);
	const { control } = useFormContext<{ description: string }>();
	const { field, fieldState } = useController({ name: 'description', control, defaultValue: '' });
	const baseline = useRef<{ raw: string; html: string } | null>(null);
	const lastValue = useRef<string | null>(null);
	const extensions = useMemo(() => createAboutExtensions(styles), []);
	const editor: Editor | null = useEditor({
		immediatelyRender: false,
		shouldRerenderOnTransaction: true,
		extensions,
		content: '',
		parseOptions: { preserveWhitespace: 'full' },
		editorProps: {
			attributes: {
				class: styles['prose-mirror'],
				role: 'textbox',
				'aria-label': t('edit.about.title'),
				'aria-multiline': 'true',
				'aria-invalid': String(!!fieldState.error),
				...(fieldState.error ? { 'aria-describedby': 'edit-about-error' } : {}),
			},
			handleKeyDown: (view, event) => {
				void view;
				return editor ? handleCodeTab(editor, event) : false;
			},
		},
		onUpdate: ({ editor }) => {
			if (!baseline.current) return;
			const html = editor.getHTML();
			const next =
				html === baseline.current.html ? baseline.current.raw : editor.isEmpty ? '' : html;
			lastValue.current = next;
			field.onChange(next);
		},
		onBlur: () => field.onBlur(),
		onCreate: ({ editor }) => {
			registerAboutPaste(editor);
		},
	});
	useEffect(() => {
		if (!editor || editor.isDestroyed) return;
		const raw = field.value ?? '';
		if (baseline.current && lastValue.current === raw) return;
		editor
			.chain()
			.setContent(normalizeHtmlContent(raw), { emitUpdate: false })
			.setMeta('addToHistory', false)
			.run();
		baseline.current = { raw, html: editor.getHTML() };
		lastValue.current = raw;
	}, [editor, field.value]);
	return (
		<Flex gap="20" className={styles.container}>
			<div className={styles.section}>
				<Flex direction="column" gap="8" className={styles.titles}>
					<Text variant="body4" color="black-800">
						{t('edit.about.title')}
					</Text>
					<Text variant="body2" color="black-800">
						{t('edit.about.description')}
					</Text>
				</Flex>
				<div className={styles['textarea-container']}>
					<div className={classNames(styles['yeahub-text-editor'], styles['inline-prose-mirror'])}>
						<BubbleMenuEditor editor={editor} />
						<EditorContent editor={editor} className={styles['editor-content']} />
					</div>
					{fieldState.error?.message && (
						<div id="edit-about-error" role="alert">
							<Text variant="body1" color="red-700">
								{fieldState.error.message}
							</Text>
						</div>
					)}
				</div>
			</div>
		</Flex>
	);
};

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const BUBBLE_MENU_OPTIONS = { offset: 6, placement: 'top' as const };

interface BubbleMenuProps {
	editor: Editor | null;
}

const BubbleMenuEditor = ({ editor }: BubbleMenuProps) => {
	const [showHeadings, setShowHeadings] = useState(false);
	const t = useTranslations(i18Namespace.profile);

	if (!editor) return null;

	return (
		<TiptapBubbleMenu
			className={styles['bubble-menu']}
			options={BUBBLE_MENU_OPTIONS}
			editor={editor}
		>
			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={
						editor.isActive('bold') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={`${t('edit.about.editor.bold')} (Ctrl+B)`}
				>
					<svg
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
						<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
						<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={
						editor.isActive('italic') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={`${t('edit.about.editor.italic')} (Ctrl+I)`}
				>
					<svg
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
						<line x1="19" y1="4" x2="10" y2="4"></line>
						<line x1="14" y1="20" x2="5" y2="20"></line>
						<line x1="15" y1="4" x2="9" y2="20"></line>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className={
						editor.isActive('underline') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={`${t('edit.about.editor.underline')} (Ctrl+U)`}
				>
					<svg
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
						<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
						<line x1="4" y1="21" x2="20" y2="21"></line>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={
						editor.isActive('strike') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={t('edit.about.editor.strike')}
				>
					<svg
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
						<path d="M16 4H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H8" />
						<line x1="4" y1="12" x2="20" y2="12" />
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={
						editor.isActive('code') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={t('edit.about.editor.code_inline')}
				>
					<svg
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
						<polyline points="16 18 22 12 16 6"></polyline>
						<polyline points="8 6 2 12 8 18"></polyline>
					</svg>
				</button>
			</div>

			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
					className={
						editor.isActive({ textAlign: 'left' })
							? styles['bubble-button-active']
							: styles['bubble-button']
					}
					title={t('edit.about.editor.align_left')}
				>
					<svg
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
						<line x1="21" y1="6" x2="3" y2="6"></line>
						<line x1="15" y1="10" x2="3" y2="10"></line>
						<line x1="21" y1="14" x2="3" y2="14"></line>
						<line x1="15" y1="18" x2="3" y2="18"></line>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
					className={
						editor.isActive({ textAlign: 'center' })
							? styles['bubble-button-active']
							: styles['bubble-button']
					}
					title={t('edit.about.editor.align_center')}
				>
					<svg
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
						<line x1="21" y1="6" x2="3" y2="6"></line>
						<line x1="18" y1="10" x2="6" y2="10"></line>
						<line x1="21" y1="14" x2="3" y2="14"></line>
						<line x1="18" y1="18" x2="6" y2="18"></line>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
					className={
						editor.isActive({ textAlign: 'right' })
							? styles['bubble-button-active']
							: styles['bubble-button']
					}
					title={t('edit.about.editor.align_right')}
				>
					<svg
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
						<line x1="21" y1="10" x2="7" y2="10"></line>
						<line x1="21" y1="6" x2="3" y2="6"></line>
						<line x1="21" y1="14" x2="3" y2="14"></line>
						<line x1="21" y1="18" x2="7" y2="18"></line>
					</svg>
				</button>
			</div>

			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => setShowHeadings(!showHeadings)}
					className={styles['bubble-button']}
					title={t('edit.about.editor.headings')}
				>
					<svg
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
						<path d="M4 12h8"></path>
						<path d="M4 18V6"></path>
						<path d="M12 18V6"></path>
						<path d="M21 18h-4c-.5 0-1-.2-1.4-.6-.4-.4-.6-.9-.6-1.4V7c0-.5.2-1 .6-1.4C16 5.2 16.5 5 17 5h4"></path>
					</svg>
				</button>
				{showHeadings && (
					<div className={styles['heading-dropdown']}>
						<button
							type="button"
							onClick={() => {
								editor.chain().focus().setParagraph().run();
								setShowHeadings(false);
							}}
							className={
								editor.isActive('paragraph')
									? styles['bubble-button-active']
									: styles['bubble-button']
							}
							title={t('edit.about.editor.paragraph')}
						>
							<svg
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
								<line x1="4" y1="6" x2="20" y2="6" />
								<line x1="4" y1="12" x2="20" y2="12" />
								<line x1="4" y1="18" x2="20" y2="18" />
							</svg>
						</button>
						{[1, 2, 3, 4, 5, 6].map((level) => (
							<button
								key={level}
								type="button"
								onClick={() => {
									editor
										.chain()
										.focus()
										.toggleHeading({ level: level as Level })
										.run();
									setShowHeadings(false);
								}}
								className={
									editor.isActive('heading', { level: level as Level })
										? styles['bubble-button-active']
										: styles['bubble-button']
								}
							>
								{`H${level}`}
							</button>
						))}
					</div>
				)}
			</div>

			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={
						editor.isActive('blockquote') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={t('edit.about.editor.blockquote')}
				>
					{`" "`}
				</button>
				<button
					type="button"
					onClick={() => {
						const isActive = editor.isActive('codeBlock');
						const command = editor.chain().focus();

						if (isActive) {
							command.toggleCodeBlock().run();
						} else {
							const { state } = editor;
							const { from, to } = state.selection;
							const slice = state.doc.slice(from, to);
							const serializer = DOMSerializer.fromSchema(editor.schema);
							const div = document.createElement('div');
							slice.content.forEach((node) => {
								const dom = serializer.serializeNode(node);
								div.appendChild(dom);
							});
							const lines: string[] = [];
							div.childNodes.forEach((node) => {
								if (node.nodeType === Node.ELEMENT_NODE) {
									lines.push((node as HTMLElement).innerText);
								} else if (node.nodeType === Node.TEXT_NODE) {
									lines.push(node.textContent || '');
								}
							});
							const plain = lines.filter((line) => line.trim().length > 0).join('\n');
							const formatted = convertSpacesToTabs(plain, 2);
							editor.commands.insertContent({
								type: 'codeBlock',
								attrs: { language: 'plaintext' },
								content: [{ type: 'text', text: formatted }],
							});
						}
					}}
					className={
						editor.isActive('codeBlock') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={t('edit.about.editor.code_block')}
				>
					{'</>'}
				</button>
			</div>

			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					className={styles['bubble-button']}
					title={`${t('edit.about.editor.undo')} (Ctrl+Z)`}
				>
					↺
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					className={styles['bubble-button']}
					title={`${t('edit.about.editor.redo')} (Ctrl+Y)`}
				>
					↻
				</button>
			</div>

			<div className={styles['bubble-menu-group']}>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={
						editor.isActive('bulletList') ? styles['bubble-button-active'] : styles['bubble-button']
					}
					title={t('edit.about.editor.bullet_list')}
				>
					<svg
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
						<line x1="8" y1="6" x2="21" y2="6"></line>
						<line x1="8" y1="12" x2="21" y2="12"></line>
						<line x1="8" y1="18" x2="21" y2="18"></line>
						<circle cx="3" cy="6" r="1"></circle>
						<circle cx="3" cy="12" r="1"></circle>
						<circle cx="3" cy="18" r="1"></circle>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={
						editor.isActive('orderedList')
							? styles['bubble-button-active']
							: styles['bubble-button']
					}
					title={t('edit.about.editor.ordered_list')}
				>
					<svg
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
						<line x1="10" y1="6" x2="21" y2="6"></line>
						<line x1="10" y1="12" x2="21" y2="12"></line>
						<line x1="10" y1="18" x2="21" y2="18"></line>
						<path d="M4 6h1v4"></path>
						<path d="M4 10h2"></path>
						<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
					</svg>
				</button>
			</div>
		</TiptapBubbleMenu>
	);
};
