import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { Error404Page } from '@/pages/error404';
import { routing } from '@/shared/config';

const GlobalNotFound = async () => {
	const locale = routing.defaultLocale;
	setRequestLocale(locale);
	const messages = await getMessages({ locale });

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<Error404Page />
		</NextIntlClientProvider>
	);
};

export default GlobalNotFound;
