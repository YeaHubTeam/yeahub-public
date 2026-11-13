import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { EditAbout } from '../index';

jest.mock('@/shared/config', () => ({ i18Namespace: { profile: 'profile' } }));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/profile.json'),
		});
	},
}));
const Harness = ({
	html = '<p>Initial text</p>',
	visible = true,
}: {
	html?: string;
	visible?: boolean;
}) => {
	const form = useForm({
		defaultValues: { description: html, other: 'Other tab' },
		mode: 'onTouched',
	});
	const draft = useWatch({ control: form.control });
	return (
		<FormProvider {...form}>
			{visible && <EditAbout />}
			<button
				type="button"
				onClick={() => form.setError('description', { message: 'Ссылки запрещены' })}
			>
				Set error
			</button>
			<output data-testid="draft">{JSON.stringify(draft)}</output>
			<output data-testid="dirty">{String(form.formState.isDirty)}</output>
		</FormProvider>
	);
};
const values = () =>
	JSON.parse(screen.getByTestId('draft').textContent) as { description: string; other: string };
const getEditor = () => {
	const editor: unknown = Reflect.get(screen.getByRole('textbox'), 'editor');
	if (!(editor instanceof Editor)) throw new Error('Expected a real Tiptap editor');
	return editor;
};
const ready = async () => {
	await screen.findByRole('textbox');
	await waitFor(() => expect(getEditor()).toBeDefined());
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1));
	});
	return getEditor();
};
beforeAll(() => {
	Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
		configurable: true,
		value: () => new DOMRect(),
	});
	Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [] });
	Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
		configurable: true,
		value: () => [],
	});
});
it('initializes supported HTML without changing the raw field or marking it dirty', async () => {
	const html =
		'<h2>Heading</h2><p><b>Bold</b> <i>Italic</i> <u>Under</u> <s>Strike</s></p><ul><li><p>Bullet</p></li></ul><ol><li><p>Number</p></li></ol><blockquote><p>Quote</p></blockquote><p><code>inline</code></p>';
	render(<Harness html={html} />);
	const editor = await ready();
	expect(editor.getHTML()).toContain('<strong>Bold</strong>');
	for (const selector of ['h2', 'strong', 'em', 'u', 's', 'ul li', 'ol li', 'blockquote', 'code'])
		expect(editor.view.dom.querySelector(selector)).not.toBeNull();
	expect(values()).toEqual({ description: html, other: 'Other tab' });
	expect(screen.getByTestId('dirty')).toHaveTextContent('false');
});
it.each(['toggleBold', 'toggleItalic', 'toggleUnderline', 'toggleStrike', 'toggleCode'] as const)(
	'uses actual Tiptap command %s and writes HTML to RHF',
	async (command) => {
		render(<Harness />);
		const editor = await ready();
		act(() => {
			editor.commands.setTextSelection({ from: 1, to: 8 });
			editor.commands[command]();
		});
		expect(values().description).toContain(
			command === 'toggleBold'
				? '<strong>'
				: command === 'toggleItalic'
					? '<em>'
					: command === 'toggleUnderline'
						? '<u>'
						: command === 'toggleStrike'
							? '<s>'
							: '<code',
		);
		expect(values().other).toBe('Other tab');
		expect(screen.getByTestId('dirty')).toHaveTextContent('true');
	},
);
it.each([1, 2, 3, 4, 5, 6] as const)('supports heading level %s', async (level) => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.setTextSelection(2);
		editor.commands.toggleHeading({ level });
	});
	expect(values().description).toContain(`<h${level}`);
});
it.each(['toggleBulletList', 'toggleOrderedList', 'toggleBlockquote', 'toggleCodeBlock'] as const)(
	'supports %s with the real extensions',
	async (command) => {
		render(<Harness />);
		const editor = await ready();
		act(() => {
			editor.commands.setTextSelection(2);
			editor.commands[command]();
		});
		expect(values().description).toContain(
			command === 'toggleBulletList'
				? '<ul'
				: command === 'toggleOrderedList'
					? '<ol'
					: command === 'toggleBlockquote'
						? '<blockquote'
						: '<pre',
		);
	},
);
it.each(['left', 'center', 'right', 'justify'])(
	'preserves %s alignment in serialized HTML',
	async (alignment) => {
		render(<Harness />);
		const editor = await ready();
		act(() => {
			editor.commands.setTextSelection(2);
			editor.commands.setTextAlign(alignment);
		});
		expect(values().description).toContain(`text-align: ${alignment}`);
	},
);
it('keeps Ctrl/Cmd+Shift+J as a real keymap command and adds no justify button', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.setTextSelection(2);
		fireEvent.keyDown(editor.view.dom, { key: 'j', code: 'KeyJ', ctrlKey: true, shiftKey: true });
	});
	expect(values().description).toContain('text-align: justify');
	expect(screen.queryByTitle(/justify|по ширине/i)).not.toBeInTheDocument();
});
it('renders the original BubbleMenu controls and heading choices', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.view.dom.focus();
		editor.commands.setTextSelection({ from: 1, to: 8 });
	});
	await waitFor(() => expect(screen.getByTitle(/Ctrl\+B/)).toBeInTheDocument());
	expect(screen.getByTitle(/Ctrl\+I/)).toBeInTheDocument();
	fireEvent.click(screen.getByTitle(/Ctrl\+B/));
	await waitFor(() => expect(values().description).toContain('<strong>'));
	const headings = document.querySelector('[title="Заголовки"]');
	expect(headings).not.toBeNull();
	fireEvent.click(headings!);
	for (const level of [1, 2, 3, 4, 5, 6]) expect(screen.getByText(`H${level}`)).toBeInTheDocument();
	fireEvent.click(screen.getByText('H3'));
	await waitFor(() => expect(values().description).toContain('<h3'));
});
it('pastes multiline plain text into the original code block with tabs', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.selectAll();
		fireEvent.paste(editor.view.dom, {
			clipboardData: {
				getData: (type: string) => (type === 'text/plain' ? '  first\n    second' : ''),
			},
		});
	});
	expect(values().description).toContain('<pre');
	expect(editor.getText()).toContain('\tfirst\n\t\tsecond');
});
it('preserves code language and the custom node view without adding extra HTML to serialized content', async () => {
	render(<Harness html={'<pre><code class="language-js">const x = 1;</code></pre>'} />);
	const editor = await ready();
	expect(
		editor.view.dom.querySelector('.code-block-wrapper code.language-javascript'),
	).not.toBeNull();
	expect(editor.getHTML()).toContain('language-js');
	expect(editor.getHTML()).not.toContain('code-block-wrapper');
});
it('supports Tab/Shift+Tab in code using the original transformation', async () => {
	render(<Harness html={'<pre><code>code</code></pre>'} />);
	const editor = await ready();
	act(() => {
		editor.commands.setTextSelection({ from: 1, to: 5 });
		fireEvent.keyDown(editor.view.dom, { key: 'Tab' });
	});
	expect(editor.getText()).toContain('\tcode');
	act(() => {
		fireEvent.keyDown(editor.view.dom, { key: 'Tab', shiftKey: true });
	});
	expect(editor.getText()).toContain('code');
	expect(editor.getText()).not.toContain('\tcode');
});
it('undoes and redoes real edits, restoring original raw HTML and dirty=false on undo', async () => {
	const html = '<p><b>Initial text</b></p>';
	render(<Harness html={html} />);
	const editor = await ready();
	act(() => {
		editor.commands.insertContentAt(2, 'NEW');
	});
	expect(screen.getByTestId('dirty')).toHaveTextContent('true');
	act(() => {
		editor.commands.undo();
	});
	expect(values().description).toBe(html);
	expect(screen.getByTestId('dirty')).toHaveTextContent('false');
	act(() => {
		editor.commands.redo();
	});
	expect(values().description).toContain('NEW');
});
it.each(['', '<p></p>'])('does not change empty input on initialization (%#)', async (html) => {
	render(<Harness html={html} />);
	await ready();
	expect(values().description).toBe(html);
	expect(screen.getByTestId('dirty')).toHaveTextContent('false');
});
it('writes an explicit empty string when the user clears the document', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.clearContent();
	});
	expect(values().description).toBe('');
	expect(screen.getByTestId('dirty')).toHaveTextContent('true');
});
it('keeps the shared draft across unmounting the tab and destroys the old instance', async () => {
	const { rerender } = render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.insertContentAt(2, 'Draft');
	});
	const draft = values().description;
	rerender(<Harness visible={false} />);
	await waitFor(() => expect(editor.isDestroyed).toBe(true));
	rerender(<Harness />);
	const reopened = await ready();
	expect(values().description).toBe(draft);
	expect(reopened.getText()).toContain('Draft');
	expect(values().other).toBe('Other tab');
});
it('sanitizes initial hostile HTML and parses only the Tiptap schema', async () => {
	render(
		<Harness
			html={
				'<script>window.attack=1</script><p style="text-align:center;color:red" onclick="alert(1)">Safe</p><img src="x" onerror="alert(1)"><iframe src="x"></iframe>'
			}
		/>,
	);
	const editor = await ready();
	expect(editor.view.dom.querySelector('script,iframe,img,[onclick],[onerror]')).toBeNull();
	expect(editor.getHTML()).toContain('text-align: center');
	expect(editor.getHTML()).not.toContain('color');
});
it('hydrates the empty SSR shell without mismatches and initializes HTML on the client', async () => {
	const element = <Harness html="<p>Hydrated</p>" />;
	const container = document.createElement('div');
	container.innerHTML = renderToString(element);
	document.body.append(container);
	const errors: unknown[] = [];
	let root: ReturnType<typeof hydrateRoot>;
	await act(async () => {
		root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(error) });
		await Promise.resolve();
	});
	await waitFor(() =>
		expect(container.querySelector('[contenteditable]')?.textContent).toBe('Hydrated'),
	);
	expect(errors).toEqual([]);
	await act(async () => {
		root!.unmount();
		await Promise.resolve();
	});
	container.remove();
});
it('has no own form, submit, backend call, unsafe HTML insertion or upward import', async () => {
	const { container } = render(<Harness />);
	await ready();
	expect(container.querySelector('form')).toBeNull();
	expect(container.querySelector('button[type="submit"]')).toBeNull();
	const source = readFileSync(join(__dirname, 'EditAbout.tsx'), 'utf8');
	expect(source).not.toMatch(/\b(useForm|fetch)\s*\(/);
	expect(source).not.toContain('dangerouslySetInnerHTML');
	expect(source).not.toMatch(/from ['"]@\/(app|widgets|features)\//);
});

it('renders RHF validation errors accessibly without modifying the field', async () => {
	render(<Harness />);
	const editor = await ready();
	fireEvent.click(screen.getByText('Set error'));
	expect(await screen.findByRole('alert')).toHaveTextContent('Ссылки запрещены');
	expect(editor.view.dom).toHaveAttribute('aria-invalid', 'true');
	expect(editor.view.dom).toHaveAttribute('aria-describedby', 'edit-about-error');
	expect(values().description).toBe('<p>Initial text</p>');
});
it('pastes supported HTML through the actual ProseMirror parser', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.selectAll();
		fireEvent.paste(editor.view.dom, {
			clipboardData: {
				files: [],
				getData: (type: string) =>
					type === 'text/html'
						? '<h3>Pasted</h3><p><u>Underlined</u></p>'
						: type === 'text/plain'
							? 'Pasted\nUnderlined'
							: '',
			},
		});
	});
	expect(editor.getHTML()).toContain('<h3');
	expect(editor.getHTML()).toContain('<u>Underlined</u>');
	expect(values().description).toBe(editor.getHTML());
});
it('keeps oversized persisted HTML unmodified and clean on initialization', async () => {
	const html = '<p>' + 'я'.repeat(33_000) + '</p>';
	render(<Harness html={html} />);
	await ready();
	expect(values().description).toBe(html);
	expect(screen.getByTestId('dirty')).toHaveTextContent('false');
});
it('does not mark an initial code-block document dirty after trailing-node normalization', async () => {
	const html = '<pre><code class="language-js">const x = 1;</code></pre>';
	render(<Harness html={html} />);
	await ready();
	expect(values().description).toBe(html);
	expect(screen.getByTestId('dirty')).toHaveTextContent('false');
});

it('pastes hostile HTML only through schema parsing without event handlers or scripts', async () => {
	render(<Harness />);
	const editor = await ready();
	act(() => {
		editor.commands.selectAll();
		fireEvent.paste(editor.view.dom, {
			clipboardData: {
				files: [],
				getData: (type: string) =>
					type === 'text/html'
						? '<p onclick="alert(1)">Safe<strong>Bold</strong></p><script>alert(1)</script><img src="x" onerror="alert(1)">'
						: type === 'text/plain'
							? 'SafeBold'
							: '',
			},
		});
	});
	expect(editor.view.dom.querySelector('script,img,[onclick],[onerror]')).toBeNull();
	expect(editor.getHTML()).toContain('<strong>Bold</strong>');
});
