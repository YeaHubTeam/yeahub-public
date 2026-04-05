import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing } from './src/shared/config';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const host = request.headers.get('host');

	if (host?.startsWith('www.')) {
		// Берем чистый домен без www и порта
		const cleanHost = host.replace(/^www\./, '').split(':')[0];

		// Определяем протокол
		const protocol = request.headers.get('x-forwarded-proto') || 'https';

		// Формируем правильный URL
		const newUrl = `${protocol}://${cleanHost}${request.nextUrl.pathname}${request.nextUrl.search}`;

		return NextResponse.redirect(newUrl, 301);
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
