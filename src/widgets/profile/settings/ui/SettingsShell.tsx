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
import styles from './SettingsShell.module.css';
import { TelegramVerification, useTelegramVerification } from './TelegramVerification';
import type { TelegramOptions } from './TelegramVerification';
import telegramStyles from './TelegramVerification.module.css';

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
}: {
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
