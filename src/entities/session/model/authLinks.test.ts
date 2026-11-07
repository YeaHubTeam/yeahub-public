import { AUTH_LINKS } from '../../../shared/config/router/constants';
import { ROUTES } from '../../../shared/config/router/routes';

it.each([
	'/',
	'/ru',
	'/ru/questions',
	'/ru/questions/react-frontend-developer/example-question',
	'/ru/collections/react-frontend-developer/example-collection',
])('login с публичного маршрута %s ведёт на локальный Next route', (pathname) => {
	for (const link of [AUTH_LINKS.login, ROUTES.login]) {
		const target = new URL(link, `http://localhost:3000${pathname}`);
		expect(target.href).toBe('http://localhost:3000/ru/auth/login');
		expect(target.href).not.toContain('undefined');
		expect(target.href).not.toContain('/ru/ru/');
	}
});

it.each([undefined, 'http://localhost:3001', 'http://localhost:3001/', 'not-a-url'])(
	'auth ссылки безопасны при legacy origin %s',
	(origin) => {
		const previous = process.env.NEXT_PUBLIC_APP_SITE_URL;
		try {
			if (origin === undefined) delete process.env.NEXT_PUBLIC_APP_SITE_URL;
			else process.env.NEXT_PUBLIC_APP_SITE_URL = origin;
			jest.isolateModules(() => {
				const { AUTH_LINKS: links } = jest.requireActual<
					typeof import('../../../shared/config/router/constants')
				>('../../../shared/config/router/constants');
				expect(links.login).toBe('/ru/auth/login');
				expect(links.register).toBe('/ru/auth/register');
			});
		} finally {
			if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_SITE_URL;
			else process.env.NEXT_PUBLIC_APP_SITE_URL = previous;
		}
	},
);

it('login остаётся внутренним при конфигурации API_URL/LANDING_URL/PORT без React origin', () => {
	const previous = process.env.NEXT_PUBLIC_APP_SITE_URL;
	try {
		delete process.env.NEXT_PUBLIC_APP_SITE_URL;
		jest.isolateModules(() => {
			const { AUTH_LINKS: links } = jest.requireActual<
				typeof import('../../../shared/config/router/constants')
			>('../../../shared/config/router/constants');
			for (const path of [
				'/ru',
				'/ru/questions',
				'/ru/questions/react-frontend-developer/example-question',
			]) {
				expect(new URL(links.login, `http://localhost:3000${path}`).href).toBe(
					'http://localhost:3000/ru/auth/login',
				);
			}
		});
	} finally {
		if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_SITE_URL;
		else process.env.NEXT_PUBLIC_APP_SITE_URL = previous;
	}
});
