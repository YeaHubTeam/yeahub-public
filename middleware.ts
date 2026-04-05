import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing } from './src/shared/config';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const host = request.headers.get('host');
	if (host?.startsWith('www.')) {
		const url = request.nextUrl.clone();
		url.host = host.replace(/^www\./, '');
		return NextResponse.redirect(url, 301);
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
