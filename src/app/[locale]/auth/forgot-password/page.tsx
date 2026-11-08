import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { ForgotPassword } from '@/features/authentication/recovery';
import { AuthPage } from '@/widgets/AuthLayout';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
	robots: { index: false, follow: false },
	referrer: 'no-referrer',
};
const ForgotPasswordPage = async ({
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
		<AuthPage variant="forgot">
			<ForgotPassword returnPage={returnPage} />
		</AuthPage>
	);
};

export default ForgotPasswordPage;
