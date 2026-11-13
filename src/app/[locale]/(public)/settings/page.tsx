import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { auth, getSettingsSnapshot } from '@/auth';
import { ROUTES, i18Namespace, redirect, routing } from '@/shared/config';
import { getTelegramWidgetConfig } from '@/shared/config/telegram.server';
import { Text } from '@/shared/ui/Text';
import { SettingsShell } from '@/widgets/profile/settings';

import {
	linkTelegram,
	readEmailVerificationStatus,
	requestVerificationEmail,
	unlinkTelegram,
} from './actions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata: Metadata = { robots: { index: false, follow: false } };

const Page = async ({ params }: { params: Promise<{ locale: string }> }) => {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();
	const session = await auth();
	if (!session?.user?.id) redirect({ href: ROUTES.auth.login.page, locale });
	const result = await getSettingsSnapshot();
	if (result.status === 'unauthenticated') redirect({ href: ROUTES.auth.login.page, locale });
	if (result.status !== 'success') {
		const t = await getTranslations({ locale, namespace: i18Namespace.profile });
		return (
			<>
				<SettingsShell />
				<div role="alert">
					<Text variant="body3">{t('page.error')}</Text>
				</div>
			</>
		);
	}
	const telegramConfig = getTelegramWidgetConfig();
	return (
		<SettingsShell
			telegramVerification={{
				botUsername: telegramConfig.status === 'success' ? telegramConfig.botUsername : null,
				telegramUsername: result.snapshot.telegramUsername,
				actions: { link: linkTelegram, unlink: unlinkTelegram },
			}}
			emailVerification={{
				email: result.snapshot.email,
				isVerified: result.snapshot.isVerified,
				actions: { send: requestVerificationEmail, read: readEmailVerificationStatus },
			}}
		/>
	);
};
export default Page;
