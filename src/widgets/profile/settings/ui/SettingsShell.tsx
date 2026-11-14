'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent } from 'react';

import { useTranslations } from 'next-intl';

import { Header, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import { AccountProfiles, useProfileManagement } from './AccountProfiles';
import type { AccountProfilesData, ProfileManagementActions } from './AccountProfiles';
import { ChangePasswordForm, usePasswordSubmission } from './ChangePasswordForm';
import type { ChangePasswordAction } from './ChangePasswordForm';
import type { AccountDeletionAction } from './DeleteAccountSection';
import { EmailVerification } from './EmailVerification';
import type { EmailActions, EmailState } from './EmailVerification';
import { usePaymentHistory } from './PaymentHistory';
import type { PaymentHistoryOptions } from './PaymentHistory';
import styles from './SettingsShell.module.css';
import { SubscribeModal, usePaymentCheckout } from './SubscribeModal';
import type { PaymentAction } from './SubscribeModal';
import { TariffTab } from './TariffTab';
import type { TariffTabProps } from './TariffTab';
import { TelegramVerification, useTelegramVerification } from './TelegramVerification';
import type { TelegramOptions } from './TelegramVerification';
import telegramStyles from './TelegramVerification.module.css';
import { TrialToast, useTariffMutationGate, useTrialActivation } from './TrialActivation';
import type { TrialAction } from './TrialActivation';
import { UnsubscribeModal, useSubscriptionCancellation } from './UnsubscribeModal';
import type { CancellationAction } from './UnsubscribeModal';

const tabs = [
	{ id: 'select-tariff', label: 'settings.tabs.select.tariff' },
	{ id: 'change-password', label: 'settings.tabs.change.password' },
	{ id: 'email-verify', label: 'settings.tabs.verify.email' },
	{ id: 'account', label: 'settings.tabs.account' },
] as const;
type TabId = (typeof tabs)[number]['id'];
const defaultTab: TabId = tabs[0].id;
const currentTab = (): TabId =>
	tabs.find((tab) => `#${tab.id}` === window.location.hash)?.id ?? defaultTab;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
	listeners.add(listener);
	window.addEventListener('hashchange', listener);
	window.addEventListener('popstate', listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('hashchange', listener);
		window.removeEventListener('popstate', listener);
	};
};

export const SettingsShell = ({
	emailVerification,
	telegramVerification,
	passwordAction,
	account,
	profileActions,
	deleteAccountAction,
	tariffData,
	paymentHistory,
	trialAction,
	paymentAction,
	cancelAction,
	cancelSubscriptionId,
}: {
	cancelAction?: CancellationAction;
	cancelSubscriptionId?: string | null;
	paymentAction?: PaymentAction;
	trialAction?: TrialAction;
	paymentHistory?: PaymentHistoryOptions;
	tariffData?: TariffTabProps;
	deleteAccountAction?: AccountDeletionAction;
	profileActions?: ProfileManagementActions;
	account?: AccountProfilesData;
	passwordAction?: ChangePasswordAction;
	telegramVerification?: TelegramOptions;
	emailVerification?: { email: string | null; isVerified: boolean; actions: EmailActions };
}) => {
	// Keep mutation locks and deletion confirmation alive across account-tab unmounts.
	const profileController = useProfileManagement(account, profileActions, deleteAccountAction);
	const passwordController = usePasswordSubmission(passwordAction);
	const telegramController = useTelegramVerification(telegramVerification);
	const [emailState, setEmailState] = useState<EmailState>({
		verified: emailVerification?.isVerified ?? false,
		pending: false,
		until: 0,
		sent: false,
	});
	const sharedGate = useTariffMutationGate();
	const cancellationController = useSubscriptionCancellation({
		action: cancelAction,
		gate: sharedGate,
		expectedSubscriptionId: cancelSubscriptionId ?? null,
		subscription: tariffData?.currentSubscription ?? null,
	});
	// Retain pagination through cancellation's automatic RSC invalidation only.
	// Other server refreshes keep the existing history reset behavior.
	const [historySource, setHistorySource] = useState({
		owner: sharedGate.identity,
		options: paymentHistory,
	});
	const retainHistory = cancellationController.retainsHistory;
	if (
		historySource.owner !== sharedGate.identity ||
		(!retainHistory && historySource.options !== paymentHistory)
	)
		setHistorySource({ owner: sharedGate.identity, options: paymentHistory });
	const historyOptions =
		retainHistory && historySource.owner === sharedGate.identity
			? historySource.options
			: paymentHistory;
	const paymentHistoryController = usePaymentHistory(historyOptions);

	const paymentController = usePaymentCheckout({
		action: paymentAction,
		gate: sharedGate,
		email: emailVerification?.email ?? null,
		isVerified: emailState.verified || emailVerification?.isVerified === true,
	});
	const trialController = useTrialActivation({
		sharedGate,
		action: trialAction,
		eligible:
			tariffData?.canStartTrial === true &&
			tariffData.catalog.status === 'success' &&
			tariffData.currentSubscription === null,
		isVerified: emailState.verified || emailVerification?.isVerified === true,
	});
	const t = useTranslations(i18Namespace.profile);
	const header = useTranslations(i18Namespace.header);
	const active = useSyncExternalStore(subscribe, currentTab, () => defaultTab);
	const buttons = useRef<(HTMLButtonElement | null)[]>([]);
	const select = (id: TabId) => {
		window.history.replaceState(
			window.history.state,
			'',
			`${window.location.pathname}${window.location.search}#${id}`,
		);
		listeners.forEach((listener) => listener());
	};
	const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const next =
			event.key === 'ArrowRight'
				? (index + 1) % tabs.length
				: event.key === 'ArrowLeft'
					? (index + tabs.length - 1) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tabs.length - 1
							: null;
		if (next === null) return;
		event.preventDefault();
		select(tabs[next].id);
		buttons.current[next]?.focus();
	};
	return (
		<>
			<TrialToast
				toast={cancellationController.toast ?? paymentController.toast ?? trialController.toast}
			/>
			<UnsubscribeModal controller={cancellationController} />
			<SubscribeModal controller={paymentController} />
			<div className={styles.tabs}>
				<div role="tablist" aria-label={header(Header.USER_SETTINGS)} className={styles.list}>
					{tabs.map((tab, index) => (
						<button
							key={tab.id}
							ref={(element) => {
								buttons.current[index] = element;
							}}
							id={`settings-tab-${tab.id}`}
							type="button"
							role="tab"
							aria-selected={active === tab.id}
							aria-controls={`settings-panel-${tab.id}`}
							tabIndex={active === tab.id ? 0 : -1}
							className={styles.tab}
							onClick={() => select(tab.id)}
							onKeyDown={(event) => keyboard(event, index)}
						>
							<Text variant="body4" color={active === tab.id ? 'purple-700' : 'black-500'}>
								{t(tab.label)}
							</Text>
						</button>
					))}
				</div>
			</div>
			{/* Keep only the active panel mounted, ready for independently implemented tab content. */}
			<section
				key={active}
				id={`settings-panel-${active}`}
				role="tabpanel"
				aria-labelledby={`settings-tab-${active}`}
				tabIndex={0}
			>
				{active === 'select-tariff' && tariffData && (
					<TariffTab
						{...tariffData}
						currentSubscription={cancellationController.subscription}
						cancellationController={cancellationController}
						paymentHistoryController={paymentHistoryController}
						trialController={trialController}
						paymentController={paymentController}
					/>
				)}
				{active === 'account' && account && (
					<AccountProfiles {...account} controller={profileController} />
				)}
				{active === 'change-password' && passwordAction && (
					<ChangePasswordForm controller={passwordController} />
				)}
				{active === 'email-verify' && (emailVerification || telegramVerification) && (
					<div className={telegramStyles.sections}>
						{emailVerification && (
							<EmailVerification
								email={emailVerification.email}
								state={emailState}
								setState={setEmailState}
								actions={emailVerification.actions}
							/>
						)}
						{telegramVerification && (
							<TelegramVerification
								botUsername={telegramVerification.botUsername}
								controller={telegramController}
							/>
						)}
					</div>
				)}
			</section>
		</>
	);
};
