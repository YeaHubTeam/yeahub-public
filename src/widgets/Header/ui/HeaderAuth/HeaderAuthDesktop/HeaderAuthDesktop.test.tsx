import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'postcss';
import { renderToStaticMarkup } from 'react-dom/server';

import { HeaderAuthDesktop } from './HeaderAuthDesktop';

jest.mock('next-intl/server', () => ({
	getLocale: () => Promise.resolve('ru'),
	getTranslations: () => Promise.resolve(() => 'Войти'),
}));
jest.mock('@/shared/config', () => ({
	Header: { AUTH_SIGN_IN: 'auth.sign.in' },
	i18Namespace: { header: 'header' },
	ROUTES: { auth: { login: { page: '/auth/login' } } },
	getPathname: ({ locale, href }: { locale: string; href: string }) => `/${locale}${href}`,
}));

// Exercise the real Button and real CSS declarations, not a mocked Button/snapshot.
// jsdom does not implement native CSS nesting/variables consistently. Only flatten
// top-level declarations: these are the rules involved in the navigation regression.
const css = (path: string) => {
	const root = parse(readFileSync(join(process.cwd(), path), 'utf8'));
	root.each((node) => {
		if (node.type !== 'rule') node.remove();
		else
			node.each((child) => {
				if (child.type !== 'decl') child.remove();
			});
	});
	return root.toString();
};
const buttonCss = css('src/shared/ui/Button/Button.module.css');
const headerCss = css(
	'src/widgets/Header/ui/HeaderAuth/HeaderAuthDesktop/HeaderAuthDesktop.module.css',
);

afterEach(() => {
	document.head.innerHTML = '';
	document.body.innerHTML = '';
});

it('uses the filled Button contract even though the element is a navigation link', async () => {
	document.body.innerHTML = renderToStaticMarkup(await HeaderAuthDesktop());
	const link = document.querySelector('a')!;
	expect(link.textContent).toBe('Войти');
	expect(link.getAttribute('href')).toBe('/ru/auth/login');
	expect([...link.classList]).toEqual([
		'button',
		'button-large',
		'button-primary',
		'register-button',
	]);
});

it.each([
	['initial route CSS', buttonCss + headerCss],
	['Button CSS loaded again after client navigation', buttonCss + headerCss + buttonCss],
	['opposite chunk order', headerCss + buttonCss],
])('keeps the 48px filled button with %s', async (_label, stylesheet) => {
	document.body.innerHTML = renderToStaticMarkup(await HeaderAuthDesktop());
	const style = document.createElement('style');
	style.textContent = stylesheet;
	document.head.append(style);
	expect(getComputedStyle(document.querySelector('a')!).height).toBe('48px');
});
