'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import {
	LoginErrors,
	LoginValues,
	WebSession,
	authPageUrl,
	endSession,
	restoreSession,
	safeReturnUrl,
	validateLogin,
} from '@/entities/session';
import { AuthField, AuthPasswordField } from '@/shared/ui/AuthField';
import { AuthTelegram } from '@/shared/ui/AuthTelegram';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

import styles from './Login.module.css';

export const Login = ({
	returnPage,
	legacyOrigin,
	registered = false,
}: {
	returnPage?: string;
	legacyOrigin?: string;
	registered?: boolean;
}) => {
	const t = useTranslations('auth');
	const router = useRouter();
	const [session, setSession] = useState<WebSession | null>(null);
	const [pending, setPending] = useState(true);
	const [message, setMessage] = useState('');
	const [values, setValues] = useState<LoginValues>({ username: '', password: '' });
	const [errors, setErrors] = useState<LoginErrors>({});
	const [touched, setTouched] = useState<Partial<Record<keyof LoginValues, boolean>>>({});
	const hadSession = useRef(false);
	const submitting = useRef(false);

	useEffect(() => {
		let active = true;
		const check = () => {
			void restoreSession()
				.then((current) => {
					if (active) {
						setSession(current);
						if (current) {
							hadSession.current = true;
							setMessage('');
						} else if (hadSession.current) {
							hadSession.current = false;
							setMessage(t('expired'));
						}
					}
				})
				.catch(() => {
					if (active) setMessage(t('unavailable'));
				})
				.finally(() => {
					if (active) setPending(false);
				});
		};
		check();
		const onVisibility = () => {
			if (document.visibilityState === 'visible') check();
		};
		const timer = window.setInterval(check, 60000);
		window.addEventListener('focus', check);
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			active = false;
			clearInterval(timer);
			window.removeEventListener('focus', check);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [t]);

	const onLogin = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		if (submitting.current) return;
		const invalid = validateLogin(values);
		setErrors(invalid);
		setTouched({ username: true, password: true });
		if (Object.keys(invalid).length) return;
		submitting.current = true;
		setPending(true);
		setMessage('');
		try {
			const operation = async () => {
				const response = await fetch('/api/auth/login', {
					method: 'POST',
					cache: 'no-store',
					credentials: 'same-origin',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: values.username.trim(),
						password: values.password,
						returnPage,
					}),
				});
				if (!response.ok) {
					setMessage(t(response.status === 401 ? 'invalidCredentials' : 'unavailable'));
					return;
				}
				const result = (await response.json()) as { session: WebSession; returnUrl: string };
				setSession(result.session);
				hadSession.current = true;
				setValues({ username: '', password: '' });
				form.reset();
				const target = safeReturnUrl(result.returnUrl);
				if (target !== '/ru/auth/login') {
					router.replace(target);
					router.refresh();
				}
			};
			if (navigator.locks) await navigator.locks.request('yh-web-session', operation);
			else await operation();
		} catch {
			setMessage(t('unavailable'));
		} finally {
			submitting.current = false;
			setPending(false);
		}
	};

	const onLogout = async () => {
		setPending(true);
		try {
			const revoked = await endSession();
			setSession(null);
			hadSession.current = false;
			setMessage(t(revoked ? 'signedOut' : 'localSignOut'));
			router.refresh();
		} catch {
			setMessage(t('unavailable'));
		} finally {
			setPending(false);
		}
	};

	const change = (field: keyof LoginValues, value: string) => {
		const next = { ...values, [field]: value };
		setValues(next);
		if (touched[field])
			setErrors((current) => ({ ...current, [field]: validateLogin(next)[field] }));
	};
	const blur = (field: keyof LoginValues) => {
		setTouched((current) => ({ ...current, [field]: true }));
		setErrors((current) => ({ ...current, [field]: validateLogin(values)[field] }));
	};

	return (
		<div className={styles.wrapper}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{session ? `${t('hello')} ${session.user.username}` : t('title')}
			</Text>
			{registered && session && (
				<div role="status">
					<Text variant="body2">{t('registrationSuccess')}</Text>
				</div>
			)}
			{pending && (
				<div role="status" className={styles.loading}>
					<Text variant="body2">{t('loading')}</Text>
				</div>
			)}
			{message && (
				<div role="alert" className={styles.message}>
					<Text variant="body1" color="red-700">
						{message}
					</Text>
				</div>
			)}
			{session ? (
				<Button
					onClick={() => {
						void onLogout();
					}}
					disabled={pending}
					size="large"
				>
					{t('logout')}
				</Button>
			) : (
				<div className={styles['create-form']}>
					<div className={styles['form-content']}>
						<form
							noValidate
							className={styles.form}
							onSubmit={(event) => {
								void onLogin(event);
							}}
						>
							<div className={styles['input-wrapper']}>
								<AuthField
									id="auth-email"
									name="username"
									type="email"
									autoComplete="username"
									label={t('loginEmailLabel')}
									placeholder={t('loginEmailPlaceholder')}
									value={values.username}
									onChange={(event) => change('username', event.target.value)}
									onBlur={() => blur('username')}
									error={errors.username ? t(errors.username) : undefined}
									disabled={pending}
									required
									maxLength={320}
								/>
							</div>
							<div className={styles['input-wrapper']}>
								<AuthPasswordField
									id="auth-password"
									name="password"
									autoComplete="current-password"
									label={t('password')}
									placeholder={t('loginPasswordPlaceholder')}
									value={values.password}
									onChange={(event) => change('password', event.target.value)}
									onBlur={() => blur('password')}
									error={errors.password ? t(errors.password) : undefined}
									showLabel={t('showPassword')}
									hideLabel={t('hidePassword')}
									disabled={pending}
									required
									maxLength={1024}
								/>
								<div className={styles['forgot-password']}>
									<Button
										variant="link"
										href={legacyOrigin ? `${legacyOrigin}/auth/forgot-password` : undefined}
										disabled={!legacyOrigin}
										aria-disabled={!legacyOrigin}
										title={!legacyOrigin ? t('forgotUnavailable') : undefined}
									>
										{t('loginForgot')}
									</Button>
								</div>
							</div>
							<Button
								type="submit"
								variant="primary"
								className={styles['submit-button']}
								disabled={pending}
							>
								{t('submit')}
							</Button>
						</form>
						<AuthTelegram caption={t('socialMedia')} unavailable={t('telegramUnavailable')} />
					</div>
					<div className={styles['registration-label']}>
						<Text variant="body2">{t('noAccount')}</Text>
						<Button href={authPageUrl('register', returnPage)} variant="link">
							{t('register')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
