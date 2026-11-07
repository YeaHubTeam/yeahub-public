import { resolveAuthUrls, resolvePublicUrlEnv } from '../../../shared/config/urlEnvironment';

const local = {
	API_URL: 'http://localhost:4002',
	LANDING_URL: 'http://localhost:3000',
	PORT: '3000',
};

it('существующего локального набора переменных достаточно для BFF', () => {
	expect(resolveAuthUrls(local)).toEqual({ apiUrl: local.API_URL, webOrigin: local.LANDING_URL });
});
it('Next config передаёт browser API client существующий API_URL', () => {
	expect(resolvePublicUrlEnv(local)).toEqual({
		NEXT_PUBLIC_API_URL: local.API_URL,
		NEXT_PUBLIC_SITE_URL: local.LANDING_URL,
	});
});
it('явные ранее поддерживаемые настройки сохраняют приоритет', () => {
	expect(
		resolveAuthUrls({
			...local,
			AUTH_API_URL: 'http://127.0.0.1:4002',
			AUTH_WEB_ORIGIN: 'http://127.0.0.1:3000',
		}),
	).toEqual({
		apiUrl: 'http://127.0.0.1:4002',
		webOrigin: 'http://127.0.0.1:3000',
	});
	expect(
		resolvePublicUrlEnv({
			...local,
			NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4002',
			NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000',
		}),
	).toEqual({
		NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4002',
		NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000',
	});
});
it('server-only values и адрес React не публикуются вместо API/Next', () => {
	const env = {
		...local,
		AUTH_API_URL: 'private',
		NEXT_PUBLIC_APP_SITE_URL: 'http://localhost:3001',
		PRIVATE_VALUE: 'must-not-publish',
	};
	expect(Object.keys(resolvePublicUrlEnv(env)).sort()).toEqual([
		'NEXT_PUBLIC_API_URL',
		'NEXT_PUBLIC_SITE_URL',
	]);
	expect(resolveAuthUrls(env).webOrigin).toBe('http://localhost:3000');
});
it('при отсутствии адресов нет hardcoded local/React fallback', () => {
	expect(resolvePublicUrlEnv({ PORT: '3000' })).toEqual({});
	expect(resolveAuthUrls({ PORT: '3000' })).toEqual({ apiUrl: undefined, webOrigin: undefined });
});
it('сохраняется конфигурация deployments с NEXT_PUBLIC_* без новых aliases', () => {
	expect(
		resolveAuthUrls({
			NEXT_PUBLIC_API_URL: local.API_URL,
			NEXT_PUBLIC_SITE_URL: local.LANDING_URL,
		}),
	).toEqual({
		apiUrl: local.API_URL,
		webOrigin: local.LANDING_URL,
	});
});
