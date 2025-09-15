import { headers } from 'next/headers';

export async function detectLocale(): Promise<string> {
	const hdrs = await headers();
	const fromCookie = hdrs.get('x-locale');
	if (fromCookie === 'ru' || fromCookie === 'en') return fromCookie;

	const accept = hdrs.get('accept-language') ?? '';
	return accept.startsWith('ru') ? 'ru' : 'en';
}
