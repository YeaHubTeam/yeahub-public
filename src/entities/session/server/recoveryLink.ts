import { NextRequest, NextResponse } from 'next/server';

import { validRecoveryToken } from '../model/recovery';
import { safeReturnUrl } from '../model/session';

export const RECOVERY_COOKIE = 'yh_web_recovery';
export const recoveryCookieOptions = (secure: boolean) => ({
	httpOnly: true,
	secure,
	sameSite: 'lax' as const,
	path: '/',
	maxAge: 3600,
});

// Runs before HTML/RSC/analytics. Compatibility with both React and localized email URLs.
export const captureRecoveryLink = (request: NextRequest): NextResponse | null => {
	const url = request.nextUrl;
	if (
		!['/auth/password-recovery', '/ru/auth/password-recovery'].includes(url.pathname) ||
		!url.searchParams.has('token')
	)
		return null;
	const tokens = url.searchParams.getAll('token');
	const target = new URL('/ru/auth/password-recovery', url.origin);
	const returnPage = safeReturnUrl(url.searchParams.get('returnPage'));
	if (returnPage !== '/ru/auth/login') target.searchParams.set('returnPage', returnPage);
	const response = NextResponse.redirect(target, 303);
	response.headers.set('Cache-Control', 'private, no-store');
	response.headers.set('Referrer-Policy', 'no-referrer');
	const valid = tokens.length === 1 && validRecoveryToken(tokens[0]);
	response.cookies.set(RECOVERY_COOKIE, valid ? tokens[0] : '', {
		...recoveryCookieOptions(url.protocol === 'https:' || process.env.NODE_ENV === 'production'),
		...(!valid ? { maxAge: 0 } : {}),
	});
	return response;
};
