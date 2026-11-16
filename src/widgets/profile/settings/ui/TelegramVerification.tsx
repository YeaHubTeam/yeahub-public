'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import type { TelegramMutationResult } from '@/entities/profile';
import { ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import styles from './TelegramVerification.module.css';
import { TelegramWidget } from './TelegramWidget';

export type TelegramLinkState = { linked: false } | { linked: true; username: string | null };
export type TelegramOptions = {
	botUsername: string | null;
	telegramUsername: string | null;
	actions: {
		link: (payload: unknown) => Promise<TelegramMutationResult>;
		unlink: () => Promise<TelegramMutationResult>;
	};
};

// Called by the persistent shell: mutation state survives panel unmount and hash navigation.
export const useTelegramVerification = (options?: TelegramOptions) => {
	const [state, setState] = useState<TelegramLinkState>(() =>
		options?.telegramUsername
			? { linked: true, username: options.telegramUsername }
			: { linked: false },
	);
	const [pending, setPending] = useState(false);
	const [feedback, setFeedback] = useState<{ error: boolean; key: string } | null>(null);
	const busy = useRef(false);
	const mounted = useRef(false);
	const router = useRouter();
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const perform = useCallback(
		async (operation: 'link' | 'unlink', payload?: unknown) => {
			if (!options || busy.current) return;
			busy.current = true;
			setPending(true);
			setFeedback(null);
			try {
				const result =
					operation === 'link'
						? await options.actions.link(payload)
						: await options.actions.unlink();
				if (!mounted.current) return;
				if (result.status === 'success') {
					setState(
						operation === 'link'
							? { linked: true, username: result.telegramUsername }
							: { linked: false },
					);
					setFeedback({ error: false, key: `telegram.feedback.${operation}Success` });
				} else {
					if (result.status === 'unauthenticated') router.replace(ROUTES.auth.login.page);
					setFeedback({
						error: true,
						key:
							result.status === 'refresh-required'
								? 'page.refresh'
								: `telegram.errors.${result.status}`,
					});
				}
			} catch {
				if (mounted.current) setFeedback({ error: true, key: 'telegram.errors.error' });
			} finally {
				busy.current = false;
				if (mounted.current) setPending(false);
			}
		},
		[options, router],
	);
	const link = useCallback(
		(payload: unknown) => {
			if (!state.linked) void perform('link', payload);
		},
		[perform, state.linked],
	);
	const unlink = useCallback(() => {
		if (state.linked) void perform('unlink');
	}, [perform, state.linked]);
	return { state, pending, feedback, link, unlink };
};

export const TelegramVerification = ({
	botUsername,
	controller,
}: {
	botUsername: string | null;
	controller: ReturnType<typeof useTelegramVerification>;
}) => {
	const t = useTranslations(i18Namespace.profile);
	const [open, setOpen] = useState(false);
	const [widgetFailed, setWidgetFailed] = useState(false);
	const { state, pending, feedback, link, unlink } = controller;
	const close = () => {
		if (!pending) setOpen(false);
	};
	const confirm = () => {
		unlink();
		setOpen(false);
	};
	return (
		<Card className={state.linked ? styles.card : undefined}>
			<div className={styles.content} aria-busy={pending}>
				{state.linked ? (
					<>
						<div className={styles.heading}>
							<Text variant="head3" className={styles.title}>
								{t('telegram.verified.title')}
							</Text>
							<StatusChip status={{ text: t('telegram.verified.status'), variant: 'green' }} />
						</div>
						<Text variant="body3" className={styles.description}>
							{t('telegram.verified.description')}
						</Text>
						{state.username && (
							<div className={styles.username}>
								<Icon icon="telegramWithBackground" size={28} color="purple-700" />
								<Text variant="body5-accent">@{state.username}</Text>
							</div>
						)}
					</>
				) : (
					<>
						<Text variant="head3">{t('telegram.verification.title')}</Text>
						<Text variant="body3">{t('telegram.verification.description')}</Text>
						{!botUsername ? (
							<Text variant="body3">{t('telegram.unavailable')}</Text>
						) : widgetFailed ? (
							<div role="alert">
								<Text variant="body3">{t('telegram.widgetError')}</Text>
							</div>
						) : (
							!pending && (
								<TelegramWidget
									botUsername={botUsername}
									onAuth={link}
									onError={() => setWidgetFailed(true)}
								/>
							)
						)}
					</>
				)}
			</div>
			{state.linked && (
				<Button
					type="button"
					variant="destructive"
					disabled={pending}
					onClick={() => setOpen(true)}
				>
					{t('telegram.verified.button')}
				</Button>
			)}
			{pending && (
				<div role="status">
					<Text variant="body3">{t('telegram.pending')}</Text>
				</div>
			)}
			{feedback && (
				<div role={feedback.error ? 'alert' : 'status'}>
					<Text variant="body3">{t(feedback.key)}</Text>
				</div>
			)}
			<Modal
				isOpen={open}
				onClose={close}
				title={t('telegram.verified.modal.title')}
				buttonPrimaryText={t('telegram.verified.modal.yes')}
				buttonOutlineText={t('telegram.verified.modal.no')}
				buttonPrimaryClick={confirm}
				buttonOutlineClick={close}
				buttonPrimaryDisabled={pending}
				buttonOutlineDisabled={pending}
			>
				<Text variant="body3">{t('telegram.verified.modal.description')}</Text>
			</Modal>
		</Card>
	);
};
