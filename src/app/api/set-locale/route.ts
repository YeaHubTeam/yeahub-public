import { NextRequest, NextResponse } from 'next/server';

// Исправленный импорт: убедитесь, что такие элементы действительно экспортируются из указанного модуля
import type {
	ChangeLocaleRequest,
	ChangeLocaleResponse,
} from '@/features/internationalization/switch-language/';
import { Language } from '@/features/internationalization/switch-language/';

function isChangeLocaleRequest(body: unknown): body is ChangeLocaleRequest {
	return (
		typeof body === 'object' &&
		body !== null &&
		'locale' in body &&
		Object.values(Language).includes((body as ChangeLocaleRequest).locale)
	);
}

export async function POST(req: NextRequest): Promise<NextResponse<ChangeLocaleResponse>> {
	const body = (await req.json()) as unknown;

	if (!isChangeLocaleRequest(body)) {
		return NextResponse.json({ ok: true }, { status: 400 });
	}

	const { locale } = body;

	const res = NextResponse.json({ ok: true } as ChangeLocaleResponse);
	res.cookies.set('locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
	});

	return res;
}
