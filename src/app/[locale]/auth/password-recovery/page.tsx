import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { setRequestLocale } from 'next-intl/server';

import { RECOVERY_COOKIE, recoveryContext } from '@/entities/session/server';
import { PasswordRecovery } from '@/features/authentication/recovery';
import { AuthPage } from '@/widgets/AuthLayout';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
	robots: { index: false, follow: false },
	referrer: 'no-referrer',
};
const PasswordRecoveryPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ returnPage?: string }>;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { returnPage } = await searchParams;
	const context = recoveryContext((await cookies()).get(RECOVERY_COOKIE)?.value);
	return (
		<AuthPage variant="recovery">
			<PasswordRecovery hasToken={!!context} context={context} returnPage={returnPage} />
		</AuthPage>
	);
};

export default PasswordRecoveryPage;
