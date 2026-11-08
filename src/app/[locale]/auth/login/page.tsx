import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { getTelegramBotName } from '@/entities/session/server';
import { Login } from '@/features/authentication/login';
import { AuthPage } from '@/widgets/AuthLayout';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const LoginPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ returnPage?: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { returnPage } = await searchParams;
	return (
		<AuthPage>
			<Login telegramBotName={getTelegramBotName()} returnPage={returnPage} />
		</AuthPage>
	);
};

export default LoginPage;
