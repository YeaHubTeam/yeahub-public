/** @jest-environment node */
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import { ProfileAbout } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { profile: 'profile', translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
	globalThis.fetch = fetchMock;
	fetchMock.mockReset();
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
});

it('renders the real server TextHtml with formatted description', () => {
	const html = renderToStaticMarkup(
		<ProfileAbout description="<p>About <strong>me</strong></p><ul><li>Experience</li></ul>" />,
	);
	const dom = new JSDOM(html);
	expect(dom.window.document.querySelector('strong')?.textContent).toBe('me');
	expect(dom.window.document.querySelector('li')?.textContent).toBe('Experience');
	expect(dom.window.document.querySelector('[role="heading"]')?.textContent).toBe('Обо мне');
	expect(dom.window.document.querySelector('a[href*="/profile/edit"]')).toBeNull();
	dom.window.close();
});

it('sanitizes untrusted HTML using the actual shared pipeline', () => {
	const html = renderToStaticMarkup(
		<ProfileAbout
			description={
				'<script>alert(1)</script><p onclick="alert(1)">Safe</p><a href="javascript:alert(1)">Link</a><img src="x" onerror="alert(1)"><iframe src="https://example.invalid"></iframe>'
			}
		/>,
	);
	const dom = new JSDOM(html);
	expect(
		dom.window.document.querySelector(
			'script, iframe, [onclick], [onerror], a[href^="javascript:"]',
		),
	).toBeNull();
	expect(dom.window.document.body.textContent).toContain('Safe');
	dom.window.close();
});

it.each([undefined, null, '', '   '])('uses the localized empty state for %s', (description) => {
	const html = renderToStaticMarkup(<ProfileAbout description={description} />);
	expect(html).toContain('Нет описания');
	expect(html).not.toContain('undefined');
});

it('preserves a long description without data loss', () => {
	const description = 'Long content '.repeat(100);
	const html = renderToStaticMarkup(<ProfileAbout description={`<p>${description}</p>`} />);
	expect(html).toContain(description);
	expect(html).not.toContain('/profile/edit');
});
