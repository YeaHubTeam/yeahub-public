import { readdirSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/shared/config', () => ({
	Main: { PROJECT_TITLE: 'projectTitle' },
	i18Namespace: { main: 'main' },
	routing: { locales: ['ru'] },
}));
jest.mock('next-intl/server', () => ({
	getTranslations: () => Promise.resolve((key: string) => key),
	getMessages: () => Promise.resolve({ auth: {} }),
	setRequestLocale: jest.fn(),
}));
jest.mock('next-intl', () => ({
	hasLocale: (_locales: string[], locale: string) => locale === 'ru',
	NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="IntlProvider">{children}</div>
	),
}));
jest.mock('@/shared/ui/AppLogo', () => ({ AppLogo: () => <span>YeaHub</span> }));
jest.mock('@/widgets/Header', () => ({ Header: () => <header>Public header</header> }));
jest.mock('@/widgets/Footer', () => ({ Footer: () => <footer>Public footer</footer> }));
const { AuthLayout, AuthPage } = jest.requireActual<typeof import('../../../widgets/AuthLayout')>(
	'../../../widgets/AuthLayout',
);
const { default: PublicLayout } = jest.requireActual<
	typeof import('../../../app/[locale]/(public)/layout')
>('../../../app/[locale]/(public)/layout');
const { default: LocaleLayout } = jest.requireActual<typeof import('../../../app/[locale]/layout')>(
	'../../../app/[locale]/layout',
);
const params = Promise.resolve({ locale: 'ru' });

it('AuthLayout имеет aside, logo и main; public Header/Footer отсутствуют', async () => {
	const markup = renderToStaticMarkup(
		await AuthLayout({
			children: (
				<AuthPage>
					<form>Login form</form>
				</AuthPage>
			),
		}),
	);
	expect(markup).toContain('<aside');
	expect(markup).toContain('layout.benefitsTitle');
	expect(markup).toContain('Login form');
	expect(markup.match(/<main/g)).toHaveLength(1);
	expect(markup).not.toMatch(/Public header|Public footer|<header|<footer/);
	expect(markup).not.toMatch(/<html|<body|IntlProvider/);
});
it('public layout сохраняет Header/Footer и прежний main', async () => {
	const markup = renderToStaticMarkup(
		await PublicLayout({ params, children: <div>Public questions</div> }),
	);
	expect(markup).toContain('Public header');
	expect(markup).toContain('Public footer');
	expect(markup).toContain('Public questions');
	expect(markup).toContain('WPHeader');
	expect(markup).not.toContain('AuthLayout');
	expect(markup).not.toContain('IntlProvider');
});
it('общий locale layout содержит один provider/drawer и не добавляет chrome', async () => {
	const markup = renderToStaticMarkup(
		await LocaleLayout({ params, children: <div>Route content</div> }),
	);
	expect(markup.match(/data-testid="IntlProvider"/g)).toHaveLength(1);
	expect(markup.match(/id="drawer-root"/g)).toHaveLength(1);
	expect(markup).not.toMatch(/Public header|Public footer|<main|<html|<body/);
});
it('auth page wrappers оставляют те же формы для login и register', () => {
	for (const variant of ['login', 'register'] as const) {
		const markup = renderToStaticMarkup(
			<AuthPage variant={variant}>
				<form data-page={variant}>Same form</form>
			</AuthPage>,
		);
		expect(markup).toContain(`data-page="${variant}"`);
		expect(markup).not.toContain('undefined');
	}
});

// Baseline URL inventory до route groups. Проверяем сохранение и отсутствие duplicate URLs.
const expectedPaths: string[] = [
	'/ru',
	'/ru/[...rest]',
	'/ru/auth/forgot-password',
	'/ru/auth/login',
	'/ru/auth/password-recovery',
	'/ru/auth/register',
	'/ru/avos',
	'/ru/collections',
	'/ru/collections/[specialization]',
	'/ru/collections/[specialization]/[slug]',
	'/ru/docs',
	'/ru/hh-analytics',
	'/ru/learning',
	'/ru/media',
	'/ru/mentor',
	'/ru/mentor-fullstack',
	'/ru/mentor-worldwide',
	'/ru/questions',
	'/ru/questions/[specialization]',
	'/ru/questions/[specialization]/[slug]',
	'/ru/quiz',
	'/ru/quiz/new',
	'/ru/quiz/result',
	'/ru/resources',
	'/ru/resources/[specialization]',
	'/ru/specializations',
	'/ru/specializations/[specializationSlug]',
	'/ru/tasks',
	'/ru/tasks/[slug]',
	'/ru/vacancies',
	'/ru/vacancies-market',
	'/ru/vacancies-market/resume-analyzer',
	'/ru/vacancies/[specialization]',
	'/ru/vacancies/[specialization]/[vacancyId]',
];
it('route group не меняет URL ни одной существующей страницы', () => {
	const root = path.resolve(__dirname, '../../../app/[locale]');
	const pages: string[] = [];
	const walk = (directory: string, segments: string[] = []) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			if (entry.isDirectory()) walk(path.join(directory, entry.name), [...segments, entry.name]);
			else if (entry.name === 'page.tsx')
				pages.push(
					'/ru' +
						(segments.filter((segment) => !segment.startsWith('(')).length
							? '/' + segments.filter((segment) => !segment.startsWith('(')).join('/')
							: ''),
				);
		}
	};
	walk(root);
	expect(pages.sort()).toEqual(expectedPaths.sort());
	expect(new Set(pages).size).toBe(pages.length);
});
