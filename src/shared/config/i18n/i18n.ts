import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from '../routing';

export const i18Namespace = {
	header: 'header',
	footer: 'footer',
	main: 'main',
	questions: 'questions',
	media: 'media',
	specialization: 'specialization',
	translation: 'translation',
	skill: 'skill',
	guru: 'guru',
	avos: 'avos',
	collection: 'collection',
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	const messages = Object.fromEntries(
		await Promise.all(
			Object.values(i18Namespace).map(async (ns) => [
				ns,
				(await import(`public/locales/${locale}/${ns}.json`)).default,
			]),
		),
	);

	return { locale, messages };
});
