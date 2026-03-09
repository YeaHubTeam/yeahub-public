import { defineRouting } from 'next-intl/routing';

import { locales } from './i18n/i18n.locales';

export const routing = defineRouting({
	locales,
	defaultLocale: 'ru',
});
