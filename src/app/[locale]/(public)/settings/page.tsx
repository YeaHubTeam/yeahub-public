import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { differenceInDays, format, getDaysInMonth, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { auth, getSettingsPageData, getSettingsPaymentHistory } from '@/auth';
import { getSpecializationById } from '@/entities/specialization';
import { ROUTES, i18Namespace, redirect, routing } from '@/shared/config';
import { getTelegramWidgetConfig } from '@/shared/config/index.server';
import { Text } from '@/shared/ui/Text';
import { SettingsShell } from '@/widgets/profile/settings';

import {
	cancelSettingsSubscription,
	changePassword,
	createSettingsProfile,
	deleteSettingsAccount,
	deleteSettingsProfile,
	initializeSettingsPayment,
	linkTelegram,
	readEmailVerificationStatus,
	readSettingsPaymentHistory,
	requestVerificationEmail,
	selectSettingsProfile,
	startSettingsTrial,
	unlinkTelegram,
} from './actions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata: Metadata = { robots: { index: false, follow: false } };

const currentSubscriptionView = (
	subscriptions: { id: string; state: string; createDate: string; endDate: string | null }[],
) => {
	const now = new Date(Date.now());
	const selected = subscriptions.find(
		({ state, endDate }) =>
			(state === 'active' || state === 'canceled') &&
			endDate !== null &&
			Number.isFinite(Date.parse(endDate)) &&
			Date.parse(endDate) >= now.getTime(),
	);
	if (!selected?.endDate) return null;
	const create = parseISO(selected.createDate);
	const end = parseISO(selected.endDate);
	return {
		expectedSubscriptionId: selected.id,
		view: {
			state: selected.state as 'active' | 'canceled',
			daysLeft: Math.max(0, differenceInDays(end, now)),
			daysInCreationMonth: getDaysInMonth(create),
			endDateLabel: format(end, 'd MMMM yyyy', { locale: ru }),
		},
	};
};

const Page = async ({ params }: { params: Promise<{ locale: string }> }) => {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();
	const session = await auth();
	if (!session?.user?.id) redirect({ href: ROUTES.auth.login.page, locale });
	const result = await getSettingsPageData();
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
	const selectedSubscription = currentSubscriptionView(result.snapshot.subscriptions);
	const currentSubscription = selectedSubscription?.view ?? null;
	const paymentHistory = currentSubscription
		? {
				ownerId: result.snapshot.userId,
				initial: await getSettingsPaymentHistory().catch(() => ({ status: 'error' as const })),
				read: readSettingsPaymentHistory,
			}
		: undefined;
	const ids = [
		...new Set(
			result.snapshot.profiles
				.map((profile) => profile.specializationId)
				.filter((id) => Number.isSafeInteger(id) && id > 0),
		),
	];
	const entries = await Promise.all(
		ids.map(async (id) => {
			try {
				const value = await getSpecializationById(id);
				return [
					id,
					value?.id === id && typeof value.title === 'string' && value.title.trim()
						? value.title
						: null,
				] as const;
			} catch {
				return [id, null] as const;
			}
		}),
	);
	const titles = new Map(entries);
	const account = {
		hasPremiumAccess: result.snapshot.hasPremiumAccess,
		username: result.snapshot.username,
		profiles: result.snapshot.profiles.map(({ id, specializationId, isActive }) => ({
			id,
			specializationId,
			isActive,
			specializationTitle: titles.get(specializationId) ?? null,
		})),
	};
	const telegramConfig = getTelegramWidgetConfig();
	return (
		<SettingsShell
			cancelAction={cancelSettingsSubscription}
			cancelSubscriptionId={selectedSubscription?.expectedSubscriptionId ?? null}
			trialAction={startSettingsTrial}
			paymentAction={initializeSettingsPayment}
			paymentHistory={paymentHistory}
			tariffData={{
				catalog: result.tariffs,
				canStartTrial: result.snapshot.canStartTrial,
				currentSubscription,
			}}
			account={account}
			deleteAccountAction={deleteSettingsAccount}
			profileActions={{
				select: selectSettingsProfile,
				create: createSettingsProfile,
				delete: deleteSettingsProfile,
			}}
			passwordAction={changePassword}
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
