/** @jest-environment node */
import { createElement } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { JSDOM } from 'jsdom';
import { createTranslator } from 'next-intl';
import messages from 'public/locales/ru/profile.json';
import { renderToStaticMarkup } from 'react-dom/server';

import { TextHtml } from '@/shared/ui/TextHtml';

import { createAboutSchema, validateNoLinks } from './aboutSchema';

const t = createTranslator({ locale: 'ru', messages });
const errors = {
	links: t('edit.about.validation.links'),
	maxBytes: t('edit.about.validation.maxBytes', { count: 65_536 }),
	invalid: t('edit.about.validation.invalid'),
};
const schema = createAboutSchema(errors);
it.each(['<p>Text</p>', '', undefined])(
	'accepts supported description (%#)',
	async (description) => {
		await expect(schema.validate({ description })).resolves.toMatchObject(
			description === undefined ? {} : { description },
		);
	},
);
it.each([
	'https://example.invalid/a',
	'<a href="/">link</a>',
	'user@example.invalid',
	'www.example.com/path',
	't.me/test',
	'192.168.1.1',
	'[link](target)',
])('preserves the React link prohibition (%#)', async (text) => {
	expect(validateNoLinks(text)).toBe(false);
	await expect(schema.validate({ description: text })).rejects.toMatchObject({
		message: errors.links,
	});
});
it.each([
	'```https://example.invalid/a```',
	'`user@example.invalid`',
	'before ```\n192.168.1.1\n``` after',
])('preserves the exact Markdown code exceptions (%#)', async (description) => {
	await expect(schema.validate({ description })).resolves.toEqual({ description });
});
it('does not incorrectly treat HTML code as the React Markdown exception', async () => {
	await expect(
		schema.validate({ description: '<pre><code>https://example.invalid/a</code></pre>' }),
	).rejects.toMatchObject({ message: errors.links });
});
it('does not retain global regex state between checks', () => {
	for (let i = 0; i < 3; i++) {
		expect(validateNoLinks('https://example.invalid/a')).toBe(false);
		expect(validateNoLinks('Safe text')).toBe(true);
	}
});
it.each(['a'.repeat(65_536), 'я'.repeat(32_768), '😀'.repeat(16_384)])(
	'accepts exactly 65536 UTF-8 bytes (%#)',
	async (description) => {
		expect(new TextEncoder().encode(description).byteLength).toBe(65_536);
		await expect(schema.validate({ description })).resolves.toEqual({ description });
	},
);
it.each(['a'.repeat(65_537), 'я'.repeat(32_768) + 'a', '😀'.repeat(16_384) + 'a'])(
	'rejects 65537 UTF-8 bytes without truncation (%#)',
	async (description) => {
		expect(new TextEncoder().encode(description).byteLength).toBe(65_537);
		await expect(schema.validate({ description })).rejects.toMatchObject({
			message: errors.maxBytes,
		});
		expect(schema.cast({ description }).description).toBe(description);
	},
);
it('counts HTML markup in the byte limit', async () => {
	await expect(
		schema.validate({ description: '<p>' + 'a'.repeat(65_530) + '</p>' }),
	).rejects.toMatchObject({ message: errors.maxBytes });
});
it.each([null, 1, {}, []])('rejects invalid description type (%#)', async (description) => {
	await expect(schema.validate({ description })).rejects.toBeDefined();
});
it('allows an unchanged legacy description over the limit without allowing an updated oversized value', async () => {
	const original = 'я'.repeat(40_000);
	const legacy = createAboutSchema(errors, original);
	await expect(
		legacy.validate({ description: original, username: 'Other field' }),
	).resolves.toMatchObject({ description: original, username: 'Other field' });
	await expect(legacy.validate({ description: original + 'a' })).rejects.toMatchObject({
		message: errors.maxBytes,
	});
});
it('supports yupResolver and an optional, explicitly cleared description', async () => {
	const resolver = yupResolver(schema);
	const options = { fields: {}, shouldUseNativeValidation: false };
	expect((await resolver({}, undefined, options)).errors).toEqual({});
	expect((await resolver({ description: '' }, undefined, options)).values).toEqual({
		description: '',
	});
});
it.each(['left', 'center', 'right', 'justify'])(
	'renders supported formatting and %s through the actual TextHtml pipeline',
	(alignment) => {
		const html = `<h2 style="text-align:${alignment}">Heading</h2><p><strong>B</strong><em>I</em><u>U</u><s>S</s><code>code</code></p><ul><li>Bullet</li></ul><ol><li>Number</li></ol><blockquote>Quote</blockquote><pre><code class="language-js">const x=1;</code></pre>`;
		const dom = new JSDOM(
			renderToStaticMarkup(createElement(TextHtml, { html, disableCodeCopy: true })),
		);
		expect(dom.window.document.querySelector('h2')?.getAttribute('style')).toBe(
			`text-align: ${alignment}`,
		);
		for (const selector of [
			'strong',
			'em',
			'u',
			's',
			'code',
			'ul li',
			'ol li',
			'blockquote',
			'pre code',
		])
			expect(dom.window.document.querySelector(selector)).not.toBeNull();
		dom.window.close();
	},
);
