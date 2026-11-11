/** @jest-environment node */
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';

import config from './next.config';

it('exports the two targeted recovery headers through the configured plugins', async () => {
	expect(await config.headers?.()).toEqual([
		{
			source: '/:locale/auth/password-recovery',
			headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
		},
		{
			source: '/auth/password-recovery',
			headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
		},
	]);
});
it.each(['/ru/auth/password-recovery', '/auth/password-recovery'])(
	'matches recovery pathname %s with the installed Next.js matcher',
	async (pathname) => {
		const rules = await config.headers!();
		const url = new URL(pathname, 'https://site.example');
		url.search = new URLSearchParams({ token: 'synthetic-test-value' }).toString();
		expect(rules.some((rule) => Boolean(getPathMatch(rule.source)(url.pathname)))).toBe(true);
	},
);
it.each([
	'/ru',
	'/ru/auth/login',
	'/ru/auth/register',
	'/ru/auth/forgot-password',
	'/ru/auth/password-recovery/extra',
	'/api/auth/session',
])('does not apply recovery policy to %s', async (pathname) => {
	const rules = await config.headers!();
	expect(rules.some((rule) => Boolean(getPathMatch(rule.source)(pathname)))).toBe(false);
});
it('preserves image settings and plugin webpack configuration', () => {
	expect(config.images?.remotePatterns).toEqual([
		{ protocol: 'https', hostname: '**.selstorage.ru', pathname: '/**' },
		{ protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
	]);
	expect(config.webpack).toEqual(expect.any(Function));
	expect(config.redirects).toBeUndefined();
	expect(config.rewrites).toBeUndefined();
});
