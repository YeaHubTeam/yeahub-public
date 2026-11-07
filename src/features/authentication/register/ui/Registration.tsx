'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import {
	RegistrationErrors,
	RegistrationField,
	RegistrationValues,
	authPageUrl,
	registerAccount,
	restoreSession,
	safeReturnUrl,
	validateRegistration,
} from '@/entities/session';
import { AuthField, AuthPasswordField } from '@/shared/ui/AuthField';
import { AuthTelegram } from '@/shared/ui/AuthTelegram';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { registrationFormErrors } from '../model/validation';
import styles from './Registration.module.css';

// Те же документы, что в React RegisterForm; содержимое внешних документов не загружается.
const documents = {
	processing:
		'https://docs.google.com/document/d/19JvySToaMm3pkohGkHwqhJjGl3IzldIc3qnQpAoVFVc/edit?tab=t.0#heading=h.gjdgxs',
	policy:
		'https://docs.google.com/document/d/1OX9Fc3HPhjL_U9xkF2P3vsSmM1fAdhmQ88J2NT0emFo/edit?tab=t.0',
	offer:
		'https://docs.google.com/document/d/1tU9lgOu_W21DAoHOH0kQmTWq5hG3rvxv_Q_jzRi8Gh4/edit?tab=t.0',
	advertising:
		'https://docs.google.com/document/d/1SaCHcZZhb9da-yOePEur3wv2C47ie2R8rPnkkxrxPqA/edit?tab=t.0',
};

export const Registration = ({ returnPage, refId }: { returnPage?: string; refId?: string }) => {
	const t = useTranslations('auth');
	const router = useRouter();
	const [values, setValues] = useState<RegistrationValues>({
		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		privacyConsent: false,
		offerConsent: false,
		adConsent: false,
		...(refId ? { refId } : {}),
	});
	const [errors, setErrors] = useState<RegistrationErrors>({});
	const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
	const [checking, setChecking] = useState(true);
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState('');
	const submitting = useRef(false);
	const target = safeReturnUrl(returnPage);
	const loginUrl = authPageUrl('login', returnPage);

	useEffect(() => {
		let active = true;
		void restoreSession()
			.then((session) => {
				if (!active) return;
				if (session) {
					router.replace(target);
					return;
				}
				setChecking(false);
			})
			.catch(() => {
				if (active) {
					setChecking(false);
					setMessage(t('unavailable'));
				}
			});
		return () => {
			active = false;
		};
	}, [router, target, t]);

	const update = (field: RegistrationField, value: string | boolean) => {
		const next = { ...values, [field]: value };
		setValues(next);
		const validation = registrationFormErrors(next);
		setErrors((current) => ({
			...current,
			[field]: touched[field] ? validation[field] : undefined,
			...(field === 'password' && touched.passwordConfirmation
				? { passwordConfirmation: validation.passwordConfirmation }
				: {}),
		}));
	};
	const blur = (field: RegistrationField) => {
		setTouched((current) => ({ ...current, [field]: true }));
		setErrors((current) => ({ ...current, [field]: registrationFormErrors(values)[field] }));
	};
	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting.current || checking) return;
		const validation = validateRegistration(values);
		const formErrors = registrationFormErrors(values);
		setErrors(formErrors);
		setTouched({
			username: true,
			email: true,
			password: true,
			passwordConfirmation: true,
			privacyConsent: true,
			offerConsent: true,
			adConsent: true,
		});
		if (!validation.values || Object.keys(formErrors).length) return;
		submitting.current = true;
		setPending(true);
		setMessage('');
		try {
			const result = await registerAccount(validation.values, target);
			if (!result.ok) {
				setErrors(result.fields ?? {});
				const key =
					result.error === 'ACCOUNT_CONFLICT'
						? 'accountConflict'
						: result.error === 'VALIDATION_FAILED'
							? 'registrationInvalid'
							: result.error === 'REGISTRATION_SESSION_FAILED'
								? 'registrationSessionFailed'
								: result.error === 'TRY_LATER'
									? 'tryLater'
									: 'registrationUnavailable';
				setMessage(t(key));
				return;
			}
			setValues((current) => ({ ...current, password: '', passwordConfirmation: '' }));
			setMessage(t('registrationSuccess'));
			const destination = safeReturnUrl(result.returnUrl);
			router.replace(
				destination === '/ru/auth/login' ? '/ru/auth/login?registered=1' : destination,
			);
			router.refresh();
		} catch {
			setMessage(t('registrationUnavailable'));
		} finally {
			submitting.current = false;
			setPending(false);
		}
	};

	const disabled = pending || checking;
	const fields = ['username', 'email', 'password', 'passwordConfirmation'] as const;
	const consents = ['privacyConsent', 'offerConsent', 'adConsent'] as const;
	const consentKeys = {
		privacyConsent: 'registrationPrivacyPolicy',
		offerConsent: 'registrationOffer',
		adConsent: 'registrationAdvertising',
	} as const;
	const placeholderKeys = {
		username: 'registrationUsernamePlaceholder',
		email: 'registrationEmailPlaceholder',
		password: 'registrationPasswordPlaceholder',
		passwordConfirmation: 'registrationPasswordPlaceholder',
	} as const;
	const documentLinks = Object.fromEntries(
		Object.entries(documents).map(([key, href]) => [
			key,
			(chunks: import('react').ReactNode) => (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					onClick={(event) => event.stopPropagation()}
				>
					{chunks}
				</a>
			),
		]),
	);
	return (
		<Flex direction="column" justify="between" align="center" className={styles.wrapper}>
			<Flex direction="column" gap="24" className={styles.content}>
				<form
					noValidate
					aria-busy={disabled}
					className={styles.form}
					onSubmit={(event) => {
						void onSubmit(event);
					}}
				>
					<Text variant="head2" isMainTitle className={styles.header}>
						{t('registrationTitle')}
					</Text>
					{checking && (
						<div role="status" className={styles.loading}>
							<Text variant="body3">{t('loading')}</Text>
						</div>
					)}
					{message && (
						<div
							role={message === t('registrationSuccess') ? 'status' : 'alert'}
							className={styles.message}
						>
							<Text
								variant="body1"
								color={message === t('registrationSuccess') ? 'black-900' : 'red-700'}
							>
								{message}
							</Text>
						</div>
					)}
					{fields.map((field) => {
						const props = {
							id: `register-${field}`,
							name: field,
							label: t(field),
							placeholder: t(placeholderKeys[field]),
							autoComplete: field.startsWith('password')
								? 'new-password'
								: field === 'email'
									? 'email'
									: 'nickname',
							required: true,
							value: values[field],
							onChange: (event: import('react').ChangeEvent<HTMLInputElement>) =>
								update(field, event.target.value),
							onBlur: () => blur(field),
							disabled,
							error: errors[field] ? t(errors[field]) : undefined,
							maxLength: field === 'username' ? 30 : field === 'email' ? 320 : 255,
						};
						return (
							<div key={field} className={styles['input-wrapper']}>
								{field.startsWith('password') ? (
									<AuthPasswordField
										{...props}
										showLabel={t('showPassword')}
										hideLabel={t('hidePassword')}
									/>
								) : (
									<AuthField {...props} type={field === 'email' ? 'email' : 'text'} />
								)}
							</div>
						);
					})}
					<Button
						type="submit"
						variant="primary"
						className={styles['submit-button']}
						disabled={disabled || Object.keys(registrationFormErrors(values)).length > 0}
					>
						{t('registrationSubmit')}
					</Button>
					<div className={styles['consent-wrapper']}>
						<Text variant="body2" className={styles['text-gap']}>
							{t('registrationPrivacyTitle')}
						</Text>
						{consents.map((field) => (
							<div
								key={field}
								className={field === 'offerConsent' ? styles['form-control'] : undefined}
							>
								<Checkbox
									id={`register-${field}`}
									name={field}
									checked={values[field]}
									disabled={disabled}
									onChange={(event) => update(field, event.target.checked)}
									onBlur={() => blur(field)}
									required={field !== 'adConsent'}
									aria-invalid={!!errors[field]}
									aria-describedby={errors[field] ? `register-${field}-error` : undefined}
									label={
										<Text variant="body1" className={styles['consent-text']}>
											{t.rich(consentKeys[field], documentLinks)}
										</Text>
									}
								/>
								{errors[field] && (
									<div id={`register-${field}-error`} role="alert">
										<Text variant="body1" color="red-700" className={styles['consent-error']}>
											{t(errors[field])}
										</Text>
									</div>
								)}
							</div>
						))}
					</div>
				</form>
				<AuthTelegram caption={t('socialMedia')} unavailable={t('telegramUnavailable')} />
			</Flex>
			<div className={styles['login-label']}>
				<Text variant="body2">{t('registrationHaveAccount')}</Text>
				<Button href={loginUrl} variant="link">
					{t('registrationLogin')}
				</Button>
			</div>
		</Flex>
	);
};
