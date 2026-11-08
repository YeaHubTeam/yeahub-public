'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { useTranslations } from 'next-intl';

import {
	RecoveryValues,
	authPageUrl,
	notifySessionChanged,
	recoveryEmailError,
	recoveryPasswordErrors,
} from '@/entities/session';
import { AuthField, AuthPasswordField } from '@/shared/ui/AuthField';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import styles from './Recovery.module.css';

// No token is accepted from props, URL or browser storage. BFF reads the HttpOnly cookie.
const mutation = async (path: string, method: 'POST' | 'PATCH', body: unknown) => {
	try {
		const response = await fetch(`/api/auth/${path}`, {
			method,
			credentials: 'same-origin',
			cache: 'no-store',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (response.ok) return { ok: true as const };
		// Only allowlisted codes enter UI, never arbitrary upstream errors.
		const result = (await response.json()) as { error?: unknown };
		return {
			ok: false as const,
			error:
				result.error === 'RECOVERY_LINK_INVALID'
					? 'invalidLink'
					: result.error === 'TRY_LATER'
						? 'tryLater'
						: result.error === 'VALIDATION_FAILED'
							? 'invalidData'
							: 'unavailable',
		};
	} catch {
		return { ok: false as const, error: 'unavailable' };
	}
};
const COOLDOWN_KEY = 'yh_recovery_resend_after';
const storedCooldown = () => {
	try {
		const value = Number(localStorage.getItem(COOLDOWN_KEY));
		return value > Date.now() && value <= Date.now() + 60000 ? value : 0;
	} catch {
		return 0;
	}
};

export const ForgotPassword = ({ returnPage }: { returnPage?: string }) => {
	const t = useTranslations('auth');
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string>();
	const [touched, setTouched] = useState(false);
	const [pending, setPending] = useState(false);
	const [sent, setSent] = useState(false);
	const [message, setMessage] = useState('');
	const deadline = useRef(0);
	const [remaining, setRemaining] = useState(0);
	const submitting = useRef(false);
	useEffect(() => {
		const update = () => {
			deadline.current = Math.max(deadline.current, storedCooldown());
			setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
		};
		const initial = window.setTimeout(update, 0);
		const timer = window.setInterval(update, 1000);
		window.addEventListener('storage', update);
		return () => {
			clearTimeout(initial);
			clearInterval(timer);
			window.removeEventListener('storage', update);
		};
	}, []);
	const send = async () => {
		if (
			submitting.current ||
			remaining > 0 ||
			Math.max(deadline.current, storedCooldown()) > Date.now()
		)
			return;
		const invalid = recoveryEmailError(email);
		setTouched(true);
		setError(invalid);
		if (invalid) return;
		submitting.current = true;
		setPending(true);
		setMessage('');
		try {
			const result = await mutation('forgot-password', 'POST', { email });
			if (!result.ok) {
				setMessage(
					t(
						result.error === 'tryLater'
							? 'tryLater'
							: result.error === 'invalidData'
								? 'recovery.emailFailed'
								: 'recovery.emailUnavailable',
					),
				);
				return;
			}
			setSent(true);
			const next = Date.now() + 60000;
			deadline.current = next;
			setRemaining(60);
			try {
				localStorage.setItem(COOLDOWN_KEY, String(next));
			} catch {
				/* No email/token is stored. */
			}
		} finally {
			submitting.current = false;
			setPending(false);
		}
	};
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void send();
	};
	return (
		<div className={styles.forgot}>
			<div>
				<Text variant="head2" isMainTitle className={styles['forgot-title']}>
					{t('recovery.forgotTitle')}
				</Text>
				<Text variant="body2" className={styles['forgot-subtitle']}>
					{t('recovery.forgotSubtitle')}
				</Text>
				<form noValidate aria-busy={pending} onSubmit={submit}>
					<div className={styles['email-field']}>
						<AuthField
							id="recovery-email"
							name="email"
							type="email"
							autoComplete="email"
							label={t('loginEmailLabel')}
							placeholder={t('loginEmailPlaceholder')}
							value={email}
							disabled={pending}
							required
							maxLength={320}
							error={error ? t(error) : undefined}
							onChange={(event) => {
								setEmail(event.target.value);
								if (touched) setError(recoveryEmailError(event.target.value));
							}}
							onBlur={() => {
								setTouched(true);
								setError(recoveryEmailError(email));
							}}
						/>
					</div>
					{message && !sent && (
						<div role="alert">
							<Text variant="body1" color="red-700">
								{message}
							</Text>
						</div>
					)}
					<Button
						type="submit"
						className={styles['full-button']}
						disabled={pending || remaining > 0 || !!recoveryEmailError(email)}
					>
						{t('recovery.send')}
					</Button>
					{remaining > 0 && !sent && (
						<div role="status">
							<Text variant="body1">{remaining}</Text>
						</div>
					)}
					{pending && (
						<div role="status">
							<Text variant="body1">{t('recovery.sending')}</Text>
						</div>
					)}
				</form>
				<div className={styles['login-link']}>
					<Button variant="link" href={authPageUrl('login', returnPage)}>
						{t('registrationLogin')}
					</Button>
				</div>
			</div>
			<div className={styles['register-strip']}>
				<Text variant="body2">{t('noAccount')}</Text>
				<Button variant="link" href={authPageUrl('register', returnPage)}>
					{t('register')}
				</Button>
			</div>
			{sent && (
				<Modal
					isOpen
					title={t('recovery.sentTitle')}
					className={styles['email-modal']}
					onClose={() => {
						if (!remaining) setSent(false);
					}}
				>
					<span
						role="dialog"
						aria-modal="true"
						aria-label={t('recovery.sentTitle')}
						className={styles['email-content']}
					>
						<Image src="/emailModal.avif" alt={t('recovery.emailIcon')} width={87} height={79} />
						<span className={styles['modal-subtitle']}>{t('recovery.sentSubtitle')}</span>
						{message && (
							<span role="alert" className={styles['modal-error']}>
								{message}
							</span>
						)}
						<span role="status" className={styles.timer}>
							{remaining > 0 ? remaining : ''}
						</span>
						<Button
							variant="tertiary"
							className={styles.resend}
							disabled={pending || remaining > 0}
							onClick={() => {
								void send();
							}}
						>
							{t('recovery.resend')}
						</Button>
						<Button variant="link" href={authPageUrl('login', returnPage)}>
							{t('registrationLogin')}
						</Button>
					</span>
				</Modal>
			)}
		</div>
	);
};

export const PasswordRecovery = ({
	context,
	hasToken,
	returnPage,
}: {
	hasToken: boolean;
	context?: string;
	returnPage?: string;
}) => {
	const t = useTranslations('auth');
	const [values, setValues] = useState<RecoveryValues>({ password: '', passwordConfirm: '' });
	const [errors, setErrors] = useState<Partial<Record<keyof RecoveryValues, string>>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof RecoveryValues, boolean>>>({});
	const [pending, setPending] = useState(false);
	const [success, setSuccess] = useState(false);
	const [invalidLink, setInvalidLink] = useState(!hasToken || !context);
	const [message, setMessage] = useState('');
	const submitting = useRef(false);
	const change = (field: keyof RecoveryValues, value: string) => {
		const next = { ...values, [field]: value };
		setValues(next);
		const validation = recoveryPasswordErrors(next);
		setErrors((current) => ({
			...current,
			[field]: touched[field] ? validation[field] : undefined,
			...(field === 'password' && touched.passwordConfirm
				? { passwordConfirm: validation.passwordConfirm }
				: {}),
		}));
	};
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting.current || invalidLink || success) return;
		const invalid = recoveryPasswordErrors(values);
		setErrors(invalid);
		setTouched({ password: true, passwordConfirm: true });
		if (Object.keys(invalid).length) return;
		submitting.current = true;
		setPending(true);
		setMessage('');
		try {
			const operation = () =>
				mutation('password-recovery', 'PATCH', { ...values, context, returnPage });
			const result = navigator.locks
				? await navigator.locks.request('yh-web-session', operation)
				: await operation();
			if (!result.ok) {
				if (result.error === 'invalidLink') setInvalidLink(true);
				else
					setMessage(
						t(
							result.error === 'tryLater'
								? 'tryLater'
								: result.error === 'invalidData'
									? 'recovery.resetFailed'
									: 'recovery.resetUnavailable',
						),
					);
				return;
			}
			notifySessionChanged();
			setSuccess(true);
			setValues({ password: '', passwordConfirm: '' });
		} finally {
			submitting.current = false;
			setPending(false);
		}
	};
	return (
		<Card className={styles.recovery}>
			<Text variant="head2" isMainTitle className={styles['recovery-title']}>
				{t('recovery.resetTitle')}
			</Text>
			<Text variant="body2" className={styles['recovery-subtitle']}>
				{t('recovery.resetSubtitle')}
			</Text>
			{invalidLink ? (
				<div role="alert">
					<Text variant="body1" color="red-700">
						{t('recovery.invalidLink')}
					</Text>
					<Button variant="link" href={authPageUrl('forgot-password', returnPage)}>
						{t('recovery.forgotTitle')}
					</Button>
				</div>
			) : success ? (
				<div role="status">
					<Text variant="body2">{t('recovery.resetSuccess')}</Text>
				</div>
			) : (
				<form
					noValidate
					aria-busy={pending}
					onSubmit={(event) => {
						void submit(event);
					}}
				>
					{(['password', 'passwordConfirm'] as const).map((field) => (
						<div key={field} className={styles['password-field']}>
							<AuthPasswordField
								id={`recovery-${field}`}
								name={field}
								label={t(field === 'password' ? 'recovery.newPassword' : 'recovery.repeatPassword')}
								placeholder={t('password')}
								autoComplete="new-password"
								required
								maxLength={255}
								value={values[field]}
								disabled={pending}
								showLabel={t('showPassword')}
								hideLabel={t('hidePassword')}
								error={errors[field] ? t(errors[field]) : undefined}
								onChange={(event) => change(field, event.target.value)}
								onBlur={() => {
									setTouched((current) => ({ ...current, [field]: true }));
									setErrors((current) => ({
										...current,
										[field]: recoveryPasswordErrors(values)[field],
									}));
								}}
							/>
						</div>
					))}
					{message && (
						<div role="alert">
							<Text variant="body1" color="red-700">
								{message}
							</Text>
						</div>
					)}
					<Button type="submit" className={styles['save-button']} disabled={pending}>
						{t('recovery.save')}
					</Button>
					{pending && (
						<div role="status">
							<Text variant="body1">{t('recovery.saving')}</Text>
						</div>
					)}
				</form>
			)}
			<div className={styles['login-link']}>
				<Button variant="link" href={authPageUrl('login', returnPage)}>
					{t('registrationLogin')}
				</Button>
			</div>
		</Card>
	);
};
