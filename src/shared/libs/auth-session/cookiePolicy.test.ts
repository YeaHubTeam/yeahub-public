import {
	TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS,
	getSessionCookieDeletionPolicy,
	getSessionCookiePolicy,
} from './cookiePolicy';

const production = { mode: 'production', secure: true } as const;
const development = { mode: 'development-http', secure: false } as const;
const createdAt = 1_000;
const lifetime = { createdAt, expiresAt: createdAt + 60 };

// JSON.parse models invalid configuration arriving across an untyped boundary.
const untypedConfig = (json: string): typeof production => JSON.parse(json);

describe('session cookie policy', () => {
	it('uses fixed secure production attributes', () => {
		expect(getSessionCookiePolicy(production, lifetime, createdAt)).toEqual({
			name: '__Host-yeahub-session',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60,
		});
	});

	it('supports explicit HTTP development with a separate non-Host name', () => {
		expect(getSessionCookiePolicy(development, lifetime, createdAt)).toEqual({
			name: 'yeahub-session-dev',
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			path: '/',
			maxAge: 60,
		});
	});

	it.each([production, development])(
		'deletes with the same identity and attributes: %o',
		(config) => {
			const installed = getSessionCookiePolicy(config, lifetime, createdAt);
			expect(getSessionCookieDeletionPolicy(config)).toEqual({ ...installed, maxAge: 0 });
		},
	);

	it('accepts the maximum absolute lifetime', () => {
		expect(
			getSessionCookiePolicy(
				production,
				{ createdAt, expiresAt: createdAt + TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS },
				createdAt,
			).maxAge,
		).toBe(TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS);
	});

	it('uses remaining lifetime without extending the absolute expiry', () => {
		expect(getSessionCookiePolicy(production, lifetime, createdAt + 20).maxAge).toBe(40);
	});

	it.each([0, -1, TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS + 1, NaN, Infinity, 0.5])(
		'rejects invalid lifetime %s',
		(duration) => {
			expect(() =>
				getSessionCookiePolicy(
					production,
					{ createdAt, expiresAt: createdAt + duration },
					createdAt,
				),
			).toThrow();
		},
	);

	it.each([createdAt - 1, lifetime.expiresAt, lifetime.expiresAt + 1, NaN])(
		'rejects an invalid current time %s',
		(now) => {
			expect(() => getSessionCookiePolicy(production, lifetime, now)).toThrow();
		},
	);

	it.each([
		'{"mode":"unsupported","secure":true}',
		'{"mode":"production","secure":false}',
		'{"mode":"development-http","secure":true}',
		'{"mode":"production"}',
		'null',
	])('rejects invalid configuration %s for both operations', (json) => {
		const config = untypedConfig(json);
		expect(() => getSessionCookiePolicy(config, lifetime, createdAt)).toThrow();
		expect(() => getSessionCookieDeletionPolicy(config)).toThrow();
	});

	it('does not propagate arbitrary cookie options or sensitive payloads', () => {
		const config = untypedConfig(
			'{"mode":"production","secure":true,"name":"other","domain":"example.com","path":"/other","httpOnly":false,"accessToken":"synthetic","userId":"synthetic"}',
		);
		const result = getSessionCookiePolicy(config, lifetime, createdAt);
		expect(Object.keys(result).sort()).toEqual([
			'httpOnly',
			'maxAge',
			'name',
			'path',
			'sameSite',
			'secure',
		]);
		expect(result).toMatchObject({ name: '__Host-yeahub-session', path: '/', httpOnly: true });
		expect(result).not.toHaveProperty('domain');
	});
});
