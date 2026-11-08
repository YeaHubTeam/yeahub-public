import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { captureRecoveryLink } from './entities/session/server/recoveryLink';
import { routing } from './shared/config';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
	const host = request.headers.get('host');
	const proto = request.headers.get('x-forwarded-proto') || 'https';

	if (host?.startsWith('www.')) {
		const cleanHost = host.replace(/^www\./, '').split(':')[0];
		const url = `${proto}://${cleanHost}${request.nextUrl.pathname}${request.nextUrl.search}`;
		return NextResponse.redirect(url, 301);
	}

	const recovery = captureRecoveryLink(request);
	if (recovery) return recovery;
	const response = intlMiddleware(request);
	if (request.nextUrl.pathname.includes('/auth/')) {
		response.headers.set('Referrer-Policy', 'no-referrer');
		response.headers.set('Cache-Control', 'private, no-store');
	}
	return response;
}

export const config = {
	matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
