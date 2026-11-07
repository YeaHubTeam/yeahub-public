import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { Registration } from '@/features/authentication/register';
import { AuthPage } from '@/widgets/AuthLayout';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const RegistrationPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ returnPage?: string; refId?: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { returnPage, refId } = await searchParams;
	return (
		<AuthPage variant="register">
			<Registration returnPage={returnPage} refId={refId} />
		</AuthPage>
	);
};

export default RegistrationPage;
