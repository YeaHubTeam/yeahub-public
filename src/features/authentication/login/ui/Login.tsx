'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import {
	LoginErrors,
	LoginValues,
	WebSession,
	acceptSession,
	authPageUrl,
	beginSessionChange,
	publicReturnUrl,
	useSession,
	validateLogin,
} from '@/entities/session';
import { TelegramAuth } from '@/features/authentication/telegram';
import { AuthField, AuthPasswordField } from '@/shared/ui/AuthField';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

import styles from './Login.module.css';

export const Login = ({
	returnPage,
	telegramBotName,
}: {
	returnPage?: string;
	telegramBotName?: string;
}) => {
	const t = useTranslations('auth');
	const router = useRouter();
	const { session, loading, unavailable } = useSession();
	const [pending, setPending] = useState(false);
	const [telegramPending, setTelegramPending] = useState(false);
	const [message, setMessage] = useState('');
	const [values, setValues] = useState<LoginValues>({ username: '', password: '' });
	const [errors, setErrors] = useState<LoginErrors>({});
	const [touched, setTouched] = useState<Partial<Record<keyof LoginValues, boolean>>>({});
	const submitting = useRef(false);

	useEffect(() => {
		if (session) router.replace(publicReturnUrl(returnPage));
	}, [session, router, returnPage]);

	const onLogin = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		if (submitting.current || telegramPending) return;
		const invalid = validateLogin(values);
		setErrors(invalid);
		setTouched({ username: true, password: true });
		if (Object.keys(invalid).length) return;
		submitting.current = true;
		setPending(true);
		beginSessionChange();
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
					acceptSession(null);
					setMessage(t(response.status === 401 ? 'invalidCredentials' : 'unavailable'));
					return;
				}
				const result = (await response.json()) as { session: WebSession; returnUrl: string };
				acceptSession(result.session);
				setValues({ username: '', password: '' });
				form.reset();
				router.replace(publicReturnUrl(result.returnUrl));
				router.refresh();
			};
			if (navigator.locks) await navigator.locks.request('yh-web-session', operation);
			else await operation();
		} catch {
			acceptSession(null);
			setMessage(t('unavailable'));
		} finally {
			submitting.current = false;
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

	if (session || loading)
		return (
			<div role="status">
				<Text variant="body2">{t('loading')}</Text>
			</div>
		);

	return (
		<div className={styles.wrapper}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{t('title')}
			</Text>
			{pending && (
				<div role="status" className={styles.loading}>
					<Text variant="body2">{t('loading')}</Text>
				</div>
			)}
			{(message || unavailable) && (
				<div role="alert" className={styles.message}>
					<Text variant="body1" color="red-700">
						{message || t('unavailable')}
					</Text>
				</div>
			)}
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
								disabled={pending || telegramPending}
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
								disabled={pending || telegramPending}
								required
								maxLength={1024}
							/>
							<div className={styles['forgot-password']}>
								<Button variant="link" href={authPageUrl('forgot-password', returnPage)}>
									{t('loginForgot')}
								</Button>
							</div>
						</div>
						<Button
							type="submit"
							variant="primary"
							className={styles['submit-button']}
							disabled={pending || telegramPending}
						>
							{t('submit')}
						</Button>
					</form>
					<TelegramAuth
						botName={telegramBotName}
						returnPage={returnPage}
						disabled={pending}
						onPendingChange={setTelegramPending}
					/>
				</div>
				<div className={styles['registration-label']}>
					<Text variant="body2">{t('noAccount')}</Text>
					<Button href={authPageUrl('register', returnPage)} variant="link">
						{t('register')}
					</Button>
				</div>
			</div>
		</div>
	);
};
