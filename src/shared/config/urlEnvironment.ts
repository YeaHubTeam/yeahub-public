// Чистые функции: не читают .env и не подставляют адрес старого React вместо Next.js.
type UrlEnvironment = Record<string, string | undefined>;

export const resolveAuthUrls = (env: UrlEnvironment) => ({
	apiUrl: env.AUTH_API_URL || env.API_URL || env.NEXT_PUBLIC_API_URL,
	webOrigin: env.AUTH_WEB_ORIGIN || env.LANDING_URL || env.NEXT_PUBLIC_SITE_URL,
});

// Публикуются только адреса, уже необходимые browser API client и public metadata.
// Остальные server environment variables в browser bundle не передаются.
export const resolvePublicUrlEnv = (env: UrlEnvironment): Record<string, string> => {
	const apiUrl = env.NEXT_PUBLIC_API_URL || env.API_URL;
	const siteUrl = env.NEXT_PUBLIC_SITE_URL || env.LANDING_URL;
	return {
		...(apiUrl ? { NEXT_PUBLIC_API_URL: apiUrl } : {}),
		...(siteUrl ? { NEXT_PUBLIC_SITE_URL: siteUrl } : {}),
	};
};
