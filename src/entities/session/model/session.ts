export interface WebSession {
	user: { id: string; username: string; email: string; isVerified: boolean };
	roles: string[];
	profiles: { id: string; specializationId: number | null; isActive: boolean }[];
	activeProfile: { id: string; specializationId: number | null; isActive: boolean } | null;
}

export const safeReturnUrl = (value: unknown): string => {
	const fallback = '/ru/auth/login';
	if (typeof value !== 'string' || value.length > 2048) return fallback;
	try {
		const decoded = decodeURIComponent(value);
		if (
			!value.startsWith('/ru') ||
			decoded.includes('\\') ||
			[...decoded].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
		)
			return fallback;
		const url = new URL(decoded, 'https://return.invalid');
		if (
			url.origin !== 'https://return.invalid' ||
			(url.pathname !== '/ru' && !url.pathname.startsWith('/ru/')) ||
			url.pathname === '/ru/auth' ||
			url.pathname.startsWith('/ru/auth/')
		)
			return fallback;
		const original = new URL(value, 'https://return.invalid');
		return `${original.pathname}${original.search}${original.hash}`;
	} catch {
		return fallback;
	}
};

export const authPageUrl = (page: 'login' | 'register', returnPage?: unknown): string => {
	const path = `/ru/auth/${page}`;
	const target = safeReturnUrl(returnPage);
	return target === '/ru/auth/login'
		? path
		: `${path}?${new URLSearchParams({ returnPage: target })}`;
};
