'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useTranslations } from 'next-intl';

import Checkmark from '@/shared/assets/icons/checkmark.svg';
import { ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Text } from '@/shared/ui/Text';

import styles from './EmailVerification.module.css';

export type SendResult = {
	status:
		| 'success'
		| 'unauthenticated'
		| 'refresh-required'
		| 'forbidden'
		| 'rate-limited'
		| 'already-verified'
		| 'error';
};
export type ReadResult =
	| { status: 'success'; isVerified: boolean }
	| { status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'error' };
export type EmailState = { verified: boolean; pending: boolean; until: number; sent: boolean };
export type EmailActions = { send: () => Promise<SendResult>; read: () => Promise<ReadResult> };
export const EmailVerification = ({
	email,
	state,
	setState,
	actions,
}: {
	email: string | null;
	state: EmailState;
	setState: Dispatch<SetStateAction<EmailState>>;
	actions: EmailActions;
}) => {
	const t = useTranslations(i18Namespace.profile);
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [remaining, setRemaining] = useState(() => Math.max(0, state.until - performance.now()));
	const [cycle, setCycle] = useState(0);
	const mounted = useRef(false);
	const sending = useRef(false);
	const reading = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		const tick = () => setRemaining(Math.max(0, state.until - performance.now()));
		tick();
		if (state.until <= performance.now()) return;
		const timer = setInterval(() => {
			tick();
			if (state.until <= performance.now()) clearInterval(timer);
		}, 1000);
		return () => clearInterval(timer);
	}, [state.until]);
	const handleError = useCallback(
		(status: string) => {
			if (status === 'unauthenticated') router.replace(ROUTES.auth.login.page);
			setError(status === 'refresh-required' ? 'page.refresh' : 'settings.email.error');
		},
		[router],
	);
	// Each cycle is created only by an explicit, successful send; recursive timeout prevents overlap.
	useEffect(() => {
		if (!cycle || state.verified) return;
		let stopped = false;
		let attempts = 0;
		let timer: ReturnType<typeof setTimeout>;
		const poll = async () => {
			if (stopped || reading.current) return;
			reading.current = true;
			attempts++;
			try {
				const result = await actions.read();
				if (stopped) return;
				if (result.status !== 'success') {
					handleError(result.status);
					return;
				}
				if (result.isVerified) {
					setState((previous) => ({ ...previous, verified: true }));
					return;
				}
				if (attempts < 60) timer = setTimeout(() => void poll(), 5000);
			} catch {
				if (!stopped) setError('settings.email.error');
			} finally {
				reading.current = false;
			}
		};
		timer = setTimeout(() => void poll(), 5000);
		return () => {
			stopped = true;
			clearTimeout(timer);
		};
		// actions and router are supplied by the stable server composition.
	}, [cycle, state.verified, actions, handleError, setState]);
	const send = async () => {
		if (
			sending.current ||
			state.pending ||
			state.verified ||
			!email ||
			state.until > performance.now()
		)
			return;
		sending.current = true;
		setState((previous) => ({ ...previous, pending: true }));
		setError(null);
		try {
			const result = await actions.send();
			// The shell retains cooldown even if this panel was unmounted during the request.
			if (result.status === 'success' || result.status === 'rate-limited') {
				setState((previous) => ({
					...previous,
					until: performance.now() + 60_000,
					sent: result.status === 'success',
				}));
			}
			if (!mounted.current) return;
			if (result.status === 'success') setCycle((value) => value + 1);
			else if (result.status === 'already-verified') {
				if (reading.current) {
					setError('settings.email.error');
					return;
				}
				reading.current = true;
				try {
					const current = await actions.read();
					if (!mounted.current) return;
					if (current.status === 'success' && current.isVerified)
						setState((previous) => ({ ...previous, verified: true }));
					else if (current.status === 'success') setError('settings.email.error');
					else handleError(current.status);
				} finally {
					reading.current = false;
				}
			} else if (result.status === 'rate-limited') setError('settings.email.rateLimited');
			else handleError(result.status);
		} catch {
			if (mounted.current) setError('settings.email.error');
		} finally {
			sending.current = false;
			setState((previous) => ({ ...previous, pending: false }));
		}
	};
	const sent = state.sent && remaining > 0;
	return (
		<Card>
			<div className={styles.wrapper}>
				{state.verified ? (
					<>
						<div className={styles.verified}>
							<Checkmark className={styles['verified-icon']} aria-hidden="true" />
							<Text variant="head3">{t('email.verification.success.verify.stub.title')}</Text>
						</div>
						<Text variant="body3" className={styles['verified-description']}>
							{t('email.verification.success.verify.stub.description')}
						</Text>
					</>
				) : (
					<>
						<div className={styles.heading}>
							<Text variant="head3">{t('email.verification.title')}</Text>
							<Text variant="body3">{t('email.verification.description')}</Text>
							{sent && (
								<Text variant="body3" color="purple-700">
									{t('email.verification.spam.message')}
								</Text>
							)}
						</div>
						<Text variant="body2" className={styles.label}>
							{t('email.verification.email')}
						</Text>
						<div className={styles.row}>
							<Input
								aria-label={t('email.verification.email')}
								placeholder="E-mail"
								value={email ?? ''}
								disabled
								className={styles.input}
							/>
							{sent ? (
								<div role="status" className={styles.success}>
									<Checkmark className={styles.icon} aria-hidden="true" />
									<Text variant="body3-strong" color="purple-700">
										{t('email.verification.sent.success')}
									</Text>
								</div>
							) : (
								<Button
									type="button"
									disabled={!email || state.pending || remaining > 0}
									aria-busy={state.pending}
									onClick={() => void send()}
									className={styles.button}
								>
									{t('email.verification.submit')}
								</Button>
							)}
						</div>
						{!email && <Text variant="body3">{t('settings.email.missing')}</Text>}
						{error && (
							<div role="alert">
								<Text variant="body3">{t(error)}</Text>
							</div>
						)}
					</>
				)}
			</div>
		</Card>
	);
};
