import type { SessionLifetime } from './types';

// Temporary BFF policy, not a backend requirement.
export const TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionCookieConfig =
	| { mode: 'production'; secure: true }
	| { mode: 'development-http'; secure: false };

const getAttributes = (config: SessionCookieConfig) => {
	if (config?.mode === 'production' && config.secure === true) {
		return {
			name: '__Host-yeahub-session',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
		} as const;
	}
	if (config?.mode === 'development-http' && config.secure === false) {
		return {
			name: 'yeahub-session-dev',
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			path: '/',
		} as const;
	}
	throw new Error('Unsupported or insecure session cookie configuration');
};

export const getSessionCookiePolicy = (
	config: SessionCookieConfig,
	{ createdAt, expiresAt }: SessionLifetime,
	now: number,
) => {
	const attributes = getAttributes(config);
	if (
		![createdAt, expiresAt, now].every((value) => Number.isSafeInteger(value) && value >= 0) ||
		now < createdAt ||
		expiresAt <= now ||
		expiresAt - createdAt > TEMPORARY_BFF_MAX_SESSION_AGE_SECONDS
	) {
		throw new Error('Invalid or expired absolute session lifetime');
	}
	return { ...attributes, maxAge: expiresAt - now };
};

export const getSessionCookieDeletionPolicy = (config: SessionCookieConfig) => ({
	...getAttributes(config),
	maxAge: 0,
});
