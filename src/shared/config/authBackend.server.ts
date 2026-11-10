import 'server-only';

export interface AuthBackendEnvironment {
	NEXT_PUBLIC_API_URL?: string;
}

export interface AuthBackendConfig {
	apiOrigin: string;
	allowedOrigins: readonly string[];
	allowLocalHttp: boolean;
}

const invalidConfiguration = () => new Error('Invalid auth backend configuration');

const parseOrigin = (value: string): string => {
	try {
		const url = new URL(value);
		const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
		if (
			(url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) ||
			url.username ||
			url.password ||
			url.search ||
			url.hash ||
			url.pathname !== '/' ||
			(value !== url.origin && value !== `${url.origin}/`)
		) {
			throw invalidConfiguration();
		}
		return url.origin;
	} catch {
		// Do not retain URL parser errors: their messages may include input values.
		throw invalidConfiguration();
	}
};

export const getAuthBackendConfig = (
	environment: AuthBackendEnvironment = {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
): AuthBackendConfig => {
	const origin = environment.NEXT_PUBLIC_API_URL?.trim();
	if (!origin) throw invalidConfiguration();

	const apiOrigin = parseOrigin(origin);

	return {
		apiOrigin,
		allowedOrigins: [apiOrigin],
		allowLocalHttp: apiOrigin.startsWith('http:'),
	};
};
