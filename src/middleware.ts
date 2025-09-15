import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const locale = request.cookies.get('locale')?.value;
	if (!locale) return NextResponse.next();

	const response = NextResponse.next();
	response.headers.set('x-locale', locale);
	return response;
}
