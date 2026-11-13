/** @jest-environment node */
import { createElement } from 'react';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import { TextHtml } from './TextHtml';
import { normalizeHtmlContent } from './normalizeHtmlContent';
import { processHtmlContent } from './processHtmlContent';

const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const alignments = ['left', 'center', 'right', 'justify'];
const windows: JSDOM[] = [];
const documentOf = (html: string) => {
	const dom = new JSDOM(html);
	windows.push(dom);
	return dom.window.document;
};
afterEach(() => {
	windows.splice(0).forEach((dom) => dom.window.close());
});

it.each(tags.flatMap((tag) => alignments.map((alignment) => ({ tag, alignment }))))(
	'preserves $alignment on $tag',
	({ tag, alignment }) => {
		const result = processHtmlContent(`<${tag} style="text-align: ${alignment}">Text</${tag}>`);
		expect(result).toEqual({
			processedHtml: `<${tag} style="text-align: ${alignment}">Text</${tag}>`,
			codeBlocks: [],
		});
	},
);
it.each(alignments)('keeps only verified %s from a mixed style', (alignment) => {
	const result = processHtmlContent(
		`<p class="existing" style="color: red; position: fixed; background-image: url(https://example.invalid/image); --custom: red; text-align: ${alignment}">Text</p>`,
	);
	const p = documentOf(result.processedHtml).querySelector('p')!;
	expect(p.getAttribute('style')).toBe(`text-align: ${alignment}`);
	expect(p.className).toBe('existing');
	expect(p.textContent).toBe('Text');
});
it.each(['div', 'span', 'ul', 'li', 'blockquote', 'a', 'pre', 'code', 'table', 'td', 'svg'])(
	'does not add alignment to %s',
	(tag) => {
		const output = processHtmlContent(
			`<${tag} style="text-align: justify">Text</${tag}>`,
		).processedHtml;
		expect(documentOf(output).querySelector('[style]')).toBeNull();
	},
);
it.each([
	'start',
	'end',
	'inherit',
	'initial',
	'unset',
	'revert',
	'match-parent',
	'var(--alignment)',
	'url(javascript:alert(1))',
	'expression(alert(1))',
	'center !important',
	'right!important',
	'justify !important',
	'center; text-align: var(--x)',
])('rejects an unapproved alignment or priority: %#', (alignment) => {
	const output = processHtmlContent(`<p style="text-align: ${alignment}">Text</p>`).processedHtml;
	expect(documentOf(output).querySelector('[style]')).toBeNull();
});
it.each([
	'color:red;position:fixed;top:0',
	'--alignment:center',
	'background:url(javascript:alert(1))',
	'width:expression(alert(1))',
	'behavior:url(test.htc)',
	'-moz-binding:url(test.xml)',
])('removes CSS without valid alignment (%#)', (style) => {
	expect(processHtmlContent(`<p style="${style}">Text</p>`).processedHtml).toBe('<p>Text</p>');
});
it('strips scripts, handlers and unsafe links while preserving canonical alignment', () => {
	const output = processHtmlContent(
		'<script>alert(1)</script><iframe src="https://example.invalid"></iframe><p style="position:fixed;text-align:justify" onclick="alert(1)" onmouseover="alert(1)">Safe<img src="x" onerror="alert(1)"><a href="javascript:alert(1)">Link</a></p>',
	).processedHtml;
	const doc = documentOf(output);
	expect(
		doc.querySelector(
			'script, iframe, [onclick], [onerror], [onmouseover], a[href^="javascript:"]',
		),
	).toBeNull();
	expect(doc.querySelector('p')?.getAttribute('style')).toBe('text-align: justify');
	expect(doc.body.textContent).toContain('Safe');
});
it('does not weaken SVG and MathML sanitization or reuse hostile alignment markers', () => {
	const source =
		'<svg onload="alert(1)" style="text-align:justify"><g onclick="alert(1)"></g></svg><math style="text-align:center"><mi>x</mi></math><p data-text-align="url(javascript:alert(1))">Safe</p>';
	const actual = processHtmlContent(source).processedHtml;
	const dom = new JSDOM('');
	windows.push(dom);
	const expected = DOMPurify(dom.window).sanitize(normalizeHtmlContent(source), {
		ADD_TAGS: ['pre', 'code'],
		ADD_ATTR: ['class', 'data-code-id'],
		FORBID_ATTR: ['style'],
	});
	expect(actual).toBe(expected);
	expect(documentOf(actual).querySelector('[style], [onload], [onclick]')).toBeNull();
});
it.each(alignments)('preserves %s when processing already sanitized HTML', (alignment) => {
	const first = processHtmlContent(
		`<h2 style="text-align: ${alignment}; color: red">Heading</h2><p style="text-align: ${alignment}">Text</p>`,
	).processedHtml;
	expect(processHtmlContent(first).processedHtml).toBe(first);
});
it('keeps the previous HTML policy for headings, lists, quotes, links and classes without alignment', () => {
	const source =
		'<h1 class="title">Heading</h1><p id="intro">Text <strong>bold</strong> <em>italic</em> <u>underlined</u></p><ul><li>one</li></ul><ol><li>two</li></ol><blockquote>quote</blockquote><a href="https://example.invalid" target="_blank">link</a>';
	const dom = new JSDOM('');
	windows.push(dom);
	const expected = DOMPurify(dom.window).sanitize(normalizeHtmlContent(source), {
		ADD_TAGS: ['pre', 'code'],
		ADD_ATTR: ['class', 'data-code-id'],
		FORBID_ATTR: ['style'],
	});
	expect(processHtmlContent(source)).toEqual({ processedHtml: expected, codeBlocks: [] });
});
it('preserves code highlighting, wrappers, code metadata and inline code behavior', () => {
	const result = processHtmlContent(
		'<p style="text-align:right">Intro <code class="inline-code">x</code></p><pre><code class="language-javascript">const x = 1;</code></pre>',
	);
	expect(result.codeBlocks).toEqual([
		{ id: 'code-block-0', content: 'const x = 1;', language: 'javascript' },
	]);
	const doc = documentOf(result.processedHtml);
	expect(
		doc.querySelector(
			'.code-block-wrapper[data-code-id="code-block-0"] pre.hljs code.language-javascript',
		)?.textContent,
	).toBe('const x = 1;');
	expect(doc.querySelector('pre code span.hljs-keyword')).not.toBeNull();
	expect(doc.querySelector('p code')?.textContent).toBe('x');
	expect(doc.querySelector('p')?.getAttribute('style')).toBe('text-align: right');
});
it.each([
	'',
	'<p style="text-align:center">Unclosed',
	'<p style="text-align:justify"><strong>Broken</p>',
	'<!-- comment -->',
])('handles empty or malformed HTML (%#)', (source) => {
	expect(() => processHtmlContent(source)).not.toThrow();
	const output = processHtmlContent(source).processedHtml;
	expect(documentOf(output).querySelector('script, [onclick]')).toBeNull();
	if (!source || source.startsWith('<!--')) expect(output).toBe('');
});
it('does not leak hooks or alignment state to a later call', () => {
	expect(processHtmlContent('<p style="text-align:center">First</p>').processedHtml).toContain(
		'text-align: center',
	);
	expect(processHtmlContent('<p style="position:fixed">Second</p>').processedHtml).toBe(
		'<p>Second</p>',
	);
});
it('renders alignment through the actual TextHtml component without losing its content', () => {
	const markup = renderToStaticMarkup(
		createElement(TextHtml, {
			html: '<h3 style="text-align:justify" onclick="alert(1)">Heading</h3><p style="text-align:center;color:red">Text</p>',
			disableCodeCopy: true,
		}),
	);
	const doc = documentOf(markup);
	expect(doc.querySelector('h3')?.getAttribute('style')).toBe('text-align: justify');
	expect(doc.querySelector('p')?.getAttribute('style')).toBe('text-align: center');
	expect(doc.querySelector('[onclick]')).toBeNull();
	expect(doc.body.textContent).toBe('HeadingText');
});

it.each([
	'text-align:center;text-align:right',
	'text-align:center;text-align:center!important',
	'text-align:c\\65 nter',
	'text-align:var(--align,center)',
	'text-align:/**/center',
])('rejects ambiguous or noncanonical source alignment CSS (%#)', (style) => {
	expect(
		documentOf(processHtmlContent(`<p style="${style}">Text</p>`).processedHtml).querySelector(
			'[style]',
		),
	).toBeNull();
});
it('does not keep !important from other properties when preserving normal alignment', () => {
	expect(
		processHtmlContent('<p style="color:red!important;text-align:center">Text</p>').processedHtml,
	).toBe('<p style="text-align: center">Text</p>');
});
