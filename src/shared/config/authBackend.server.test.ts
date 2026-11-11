import { getAuthBackendConfig } from './authBackend.server';

jest.mock('server-only', () => ({}), { virtual: true });

const origin = 'https://backend.example';
const valid = { NEXT_PUBLIC_API_URL: origin };

describe('auth backend server configuration', () => {
	it('uses NEXT_PUBLIC_API_URL as the only allowed HTTPS origin', () => {
		expect(getAuthBackendConfig(valid)).toEqual({
			apiOrigin: origin,
			allowedOrigins: [origin],
			allowLocalHttp: false,
		});
	});
	it('trims whitespace and normalizes a trailing slash', () => {
		expect(getAuthBackendConfig({ NEXT_PUBLIC_API_URL: ` ${origin}/ ` })).toEqual({
			apiOrigin: origin,
			allowedOrigins: [origin],
			allowLocalHttp: false,
		});
	});
	it.each([undefined, '', '   '])('rejects missing or empty URL: %s', (value) => {
		expect(() => getAuthBackendConfig({ NEXT_PUBLIC_API_URL: value })).toThrow(
			'Invalid auth backend configuration',
		);
	});
	it.each([
		'not-a-url',
		'https://user:synthetic-password@backend.example',
		`${origin}?query=synthetic`,
		`${origin}#synthetic`,
		`${origin}/auth`,
		`${origin}/../`,
		'http://backend.example',
		'http://localhost.evil.example',
		'http://192.168.1.1',
		'ftp://localhost',
		'//backend.example',
		`${origin},https://other.example`,
	])('rejects unsafe origin without silently removing URL parts: %s', (value) => {
		expect(() => getAuthBackendConfig({ NEXT_PUBLIC_API_URL: value })).toThrow();
	});
	it.each(['http://localhost:4002', 'http://127.0.0.1:4002', 'http://[::1]:4002'])(
		'allows factory-compatible loopback HTTP: %s',
		(value) => {
			expect(getAuthBackendConfig({ NEXT_PUBLIC_API_URL: value })).toEqual({
				apiOrigin: value,
				allowedOrigins: [value],
				allowLocalHttp: true,
			});
		},
	);
	it('does not expose rejected configuration in error messages', () => {
		try {
			getAuthBackendConfig({
				NEXT_PUBLIC_API_URL: 'https://user:synthetic-password@backend.example',
			});
			throw new Error('Expected rejection');
		} catch (error) {
			expect(error).toEqual(new Error('Invalid auth backend configuration'));
			expect(String(error)).not.toContain('synthetic-password');
			expect(error).not.toHaveProperty('cause');
		}
	});
	it('does not require or read legacy settings or AUTH_SECRET', () => {
		const environment = {
			...valid,
			get AUTH_API_ORIGIN(): string {
				throw new Error('Must not read legacy origin');
			},
			get AUTH_API_ALLOWED_ORIGINS(): string {
				throw new Error('Must not read legacy allowlist');
			},
			get AUTH_SECRET(): string {
				throw new Error('Must not read secret');
			},
		};
		expect(getAuthBackendConfig(environment)).toEqual({
			apiOrigin: origin,
			allowedOrigins: [origin],
			allowLocalHttp: false,
		});
	});
	it('has no fallback to legacy values or default URLs', () => {
		const legacyOnly = {
			NEXT_PUBLIC_API_URL: undefined,
			AUTH_API_ORIGIN: origin,
			AUTH_API_ALLOWED_ORIGINS: origin,
		};
		expect(() => getAuthBackendConfig(legacyOnly)).toThrow();
		expect(() => getAuthBackendConfig({})).toThrow();
	});
	it('reads only NEXT_PUBLIC_API_URL at runtime', () => {
		const reads: string[] = [];
		const environment = new Proxy(
			{ NODE_ENV: 'test' as const },
			{
				get(_target, key) {
					reads.push(String(key));
					if (key === 'NEXT_PUBLIC_API_URL') return origin;
					throw new Error('Unexpected environment read');
				},
			},
		);
		jest.replaceProperty(process, 'env', environment);
		try {
			expect(getAuthBackendConfig().apiOrigin).toBe(origin);
			expect(reads).toEqual(['NEXT_PUBLIC_API_URL']);
		} finally {
			jest.restoreAllMocks();
		}
	});
	it('does not cache runtime configuration', () => {
		const environment = { NODE_ENV: 'test' as const, NEXT_PUBLIC_API_URL: origin };
		jest.replaceProperty(process, 'env', environment);
		try {
			expect(getAuthBackendConfig().apiOrigin).toBe(origin);
			environment.NEXT_PUBLIC_API_URL = 'http://localhost:4002';
			expect(getAuthBackendConfig()).toEqual({
				apiOrigin: 'http://localhost:4002',
				allowedOrigins: ['http://localhost:4002'],
				allowLocalHttp: true,
			});
		} finally {
			jest.restoreAllMocks();
		}
	});
	it('does not read configuration during module import', () => {
		jest.isolateModules(() => {
			const environment = new Proxy(
				{ NODE_ENV: 'test' as const },
				{
					get() {
						throw new Error('Environment read during import');
					},
				},
			);
			jest.replaceProperty(process, 'env', environment);
			try {
				expect(() => jest.requireActual('./authBackend.server')).not.toThrow();
			} finally {
				jest.restoreAllMocks();
			}
		});
	});
});
