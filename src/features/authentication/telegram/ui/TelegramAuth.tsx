'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { WebSession, parseTelegramPayload, publicReturnUrl } from '@/entities/session';
import { acceptSession, beginSessionChange } from '@/entities/session';
import { AuthTelegram } from '@/shared/ui/AuthTelegram';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

import styles from './TelegramAuth.module.css';

// Legacy Widget callback table. Each mounted instance has its own removable entry.
declare global {
	interface Window {
		YeaHubTelegramCallbacks?: Record<string, (user: unknown) => void>;
	}
}

const TelegramWidget = ({
	botName,
	onAuth,
	onError,
	onReady,
	disabled,
}: {
	botName: string;
	onAuth: (payload: unknown) => void;
	onError: () => void;
	onReady: () => void;
	disabled: boolean;
}) => {
	const id = 'yh' + useId().replace(/[^a-zA-Z0-9]/g, '');
	const container = useRef<HTMLDivElement>(null);
	const callbacks = useRef({ onAuth, onError, onReady, disabled });
	useEffect(() => {
		callbacks.current = { onAuth, onError, onReady, disabled };
	});
	useEffect(() => {
		const root = container.current;
		if (!root) return;
		let active = true,
			ready = false;
		const table = window.YeaHubTelegramCallbacks ?? (window.YeaHubTelegramCallbacks = {});
		table[id] = (user) => {
			if (active && !callbacks.current.disabled) callbacks.current.onAuth(user);
		};
		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-widget.js?9';
		script.async = true;
		script.setAttribute('data-telegram-login', botName);
		script.setAttribute('data-size', 'large');
		script.setAttribute('data-radius', '15');
		script.setAttribute('data-request-access', 'write');
		script.setAttribute('data-userpic', 'true');
		script.setAttribute('data-lang', 'en');
		script.setAttribute('data-onauth', `YeaHubTelegramCallbacks.${id}(user)`);
		const error = () => {
			if (active && !ready) {
				active = false;
				delete table[id];
				callbacks.current.onError();
			}
		};
		const detect = () => {
			if (active && !ready && root.querySelector('iframe')) {
				ready = true;
				clearTimeout(timer);
				callbacks.current.onReady();
			}
		};
		const observer = new MutationObserver(detect);
		observer.observe(root, { childList: true, subtree: true });
		const timer = window.setTimeout(error, 10000);
		script.onerror = error;
		script.onload = detect;
		root.appendChild(script);
		return () => {
			active = false;
			clearTimeout(timer);
			observer.disconnect();
			delete table[id];
			if (!Object.keys(table).length && window.YeaHubTelegramCallbacks === table)
				delete window.YeaHubTelegramCallbacks;
			script.onerror = null;
			script.onload = null;
			root.replaceChildren();
		};
	}, [botName, id]);
	return (
		<div ref={container} inert={disabled} aria-disabled={disabled} className={styles.widget} />
	);
};

export const TelegramAuth = ({
	botName,
	returnPage,
	disabled = false,
	onSuccess,
	onPendingChange,
}: {
	botName?: string;
	returnPage?: string;
	disabled?: boolean;
	onSuccess?: (session: WebSession) => void;
	onPendingChange?: (pending: boolean) => void;
}) => {
	const t = useTranslations('auth');
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [widgetError, setWidgetError] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const processing = useRef(false);
	const completed = useRef(false);
	const seen = useRef(new Set<string>());
	const active = useRef(true);
	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	const authenticate = async (value: unknown) => {
		if (processing.current || completed.current || disabled) return;
		if (value === false || value === null) {
			setMessage(t('telegram.cancelled'));
			return;
		}
		const payload = parseTelegramPayload(value);
		if (!payload) {
			setMessage(t('telegram.invalid'));
			return;
		}
		if (seen.current.has(payload.hash)) return;
		seen.current.add(payload.hash);
		processing.current = true;
		beginSessionChange();
		setPending(true);
		onPendingChange?.(true);
		setMessage('');
		try {
			const operation = () =>
				fetch('/api/auth/telegram', {
					method: 'POST',
					credentials: 'same-origin',
					cache: 'no-store',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ payload, returnPage }),
				});
			const response = navigator.locks
				? await navigator.locks.request('yh-web-session', operation)
				: await operation();
			if (!response.ok) {
				acceptSession(null);
				const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
				const key =
					body?.error === 'TELEGRAM_EXPIRED'
						? 'telegram.expired'
						: body?.error === 'TELEGRAM_INVALID'
							? 'telegram.invalid'
							: body?.error === 'TELEGRAM_DENIED'
								? 'telegram.denied'
								: body?.error === 'TRY_LATER'
									? 'tryLater'
									: body?.error === 'ACCOUNT_CONFLICT'
										? 'accountConflict'
										: 'telegram.unavailable';
				setMessage(t(key));
				return;
			}
			const body = (await response.json()) as { session: WebSession; returnUrl: string };
			if (!body.session?.user?.id) throw new Error('TELEGRAM_SESSION');
			completed.current = true;
			acceptSession(body.session);
			onSuccess?.(body.session);
			if (!active.current) return;
			router.replace(publicReturnUrl(body.returnUrl));
			router.refresh();
		} catch {
			acceptSession(null);
			if (active.current) setMessage(t('telegram.unavailable'));
		} finally {
			processing.current = false;
			if (active.current) {
				setPending(false);
				onPendingChange?.(false);
			}
		}
	};
	return (
		<AuthTelegram caption={t('socialMedia')} unavailable={t('telegram.notConfigured')}>
			{botName ? (
				<div className={styles.content} aria-busy={pending || loading}>
					{!widgetError && (
						<TelegramWidget
							key={attempt}
							botName={botName}
							disabled={disabled || pending || (!!message && message !== t('telegram.cancelled'))}
							onAuth={(value) => {
								void authenticate(value);
							}}
							onReady={() => setLoading(false)}
							onError={() => {
								setLoading(false);
								setWidgetError(true);
								setMessage(t('telegram.widgetFailed'));
							}}
						/>
					)}
					{(pending || loading) && (
						<div role="status">
							<Text variant="body1">
								{t(pending ? 'telegram.loading' : 'telegram.widgetLoading')}
							</Text>
						</div>
					)}
					{message && (
						<div role={message === t('telegram.cancelled') ? 'status' : 'alert'}>
							<Text
								variant="body1"
								color={message === t('telegram.cancelled') ? 'black-900' : 'red-700'}
							>
								{message}
							</Text>
						</div>
					)}
					{(widgetError || (message && !pending)) && (
						<Button
							type="button"
							variant="secondary"
							disabled={disabled || pending}
							onClick={() => {
								seen.current.clear();
								setMessage('');
								setWidgetError(false);
								setLoading(true);
								setAttempt((current) => current + 1);
							}}
						>
							{t('telegram.retry')}
						</Button>
					)}
				</div>
			) : undefined}
		</AuthTelegram>
	);
};
