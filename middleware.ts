import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing } from './src/shared/config';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
	const host = request.headers.get('host');
	const proto = request.headers.get('x-forwarded-proto') || 'https';

	if (host?.startsWith('www.')) {
		const cleanHost = host.replace(/^www\./, '').split(':')[0];
		const url = `${proto}://${cleanHost}${request.nextUrl.pathname}${request.nextUrl.search}`;
		return NextResponse.redirect(url, 301);
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
