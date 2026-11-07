import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { Login } from '@/features/authentication/login';
import { AuthPage } from '@/widgets/AuthLayout';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const LoginPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ returnPage?: string; registered?: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { returnPage, registered } = await searchParams;
	let legacyOrigin: string | undefined;
	try {
		const legacy = new URL(process.env.NEXT_PUBLIC_APP_SITE_URL || 'invalid:');
		if (['http:', 'https:'].includes(legacy.protocol) && !legacy.username && !legacy.password)
			legacyOrigin = legacy.origin;
	} catch {
		/* Без настроенного legacy origin не создаём неработающие ссылки. */
	}
	return (
		<AuthPage>
			<Login returnPage={returnPage} legacyOrigin={legacyOrigin} registered={registered === '1'} />
		</AuthPage>
	);
};

export default LoginPage;
