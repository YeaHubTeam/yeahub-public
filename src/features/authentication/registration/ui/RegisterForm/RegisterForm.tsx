'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { SignUpFormValues } from '@/entities/auth';
import { Auth, i18Namespace } from '@/shared/config';
import {
	AD_CONSENT_LINK,
	CONSENT_PROCESSING_LINK,
	OFFER_AGREEMENT_LINK,
	PRIVACY_POLICY_LINK,
} from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { FormControl } from '@/shared/ui/FormControl';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Text } from '@/shared/ui/Text';

import styles from './RegisterForm.module.css';

export const RegisterForm = () => {
	const {
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useFormContext<SignUpFormValues>();

	const onRegistration = (_data: SignUpFormValues) => {
		// Auth API integration is deferred; validation only.
	};

	const t = useTranslations(i18Namespace.auth);

	return (
		<form
			className={styles['form-wrapper']}
			onSubmit={(event) => {
				void handleSubmit((data) =>
					onRegistration({ ...data, username: data.username.trim(), email: data.email.trim() }),
				)(event);
			}}
		>
			<Text variant="head2" className={styles.header}>
				{t(Auth.REGISTRATION_TITLE)}
			</Text>

			<div className={styles['input-wrapper']}>
				<FormControl name="username" control={control} label={t(Auth.FORM_USERNAME_LABEL)}>
					{(field) => (
						<Input
							{...field}
							onBlur={(event) => {
								field.onChange(event.currentTarget.value.trim());
								field.onBlur();
							}}
							className={styles.input}
							placeholder={t(Auth.FORM_USERNAME_PLACEHOLDER)}
						/>
					)}
				</FormControl>
			</div>
			<div className={styles['input-wrapper']}>
				<FormControl name="email" control={control} label={t(Auth.FORM_EMAIL_LABEL)}>
					{(field) => (
						<Input
							{...field}
							onBlur={(event) => {
								field.onChange(event.currentTarget.value.trim());
								field.onBlur();
							}}
							className={styles.input}
							placeholder={t(Auth.FORM_EMAIL_PLACEHOLDER)}
						/>
					)}
				</FormControl>
			</div>
			<div className={styles['input-wrapper']}>
				<PasswordInput
					name="password"
					error={errors.password?.message}
					label={t(Auth.FORM_PASSWORD_LABEL)}
					placeholder={t(Auth.FORM_PASSWORD_PLACEHOLDER)}
				/>
			</div>
			<div className={styles['input-wrapper']}>
				<PasswordInput
					name="passwordConfirmation"
					error={errors.passwordConfirmation?.message}
					label={t(Auth.FORM_PASSWORD_REPEAT_LABEL)}
					placeholder={t(Auth.FORM_PASSWORD_PLACEHOLDER)}
				/>
			</div>

			<Button
				type="submit"
				disabled={!isValid}
				variant="primary"
				className={styles['submit-button']}
			>
				{t(Auth.REGISTRATION_SUBMIT)}
			</Button>
			<div className={styles['consent-wrapper']}>
				<Text variant="body2" className={styles['text-gap']}>
					{t(Auth.REGISTRATION_PRIVACY_TITLE)}
				</Text>
				<FormControl name="privacyConsent" control={control}>
					{(field) => (
						<Checkbox
							{...field}
							checked={Boolean(field.value)}
							onChange={(event) => field.onChange(event.currentTarget.checked)}
							label={
								<p>
									{t.rich(Auth.REGISTRATION_PRIVACY_POLICY, {
										processingLink: (chunks) => (
											<a href={CONSENT_PROCESSING_LINK} target="_blank" rel="noopener noreferrer">
												{chunks}
											</a>
										),
										policyLink: (chunks) => (
											<a href={PRIVACY_POLICY_LINK} target="_blank" rel="noopener noreferrer">
												{chunks}
											</a>
										),
									})}
								</p>
							}
						/>
					)}
				</FormControl>
				<FormControl name="offerConsent" control={control} className={styles['form-control']}>
					{(field) => (
						<Checkbox
							{...field}
							checked={Boolean(field.value)}
							onChange={(event) => field.onChange(event.currentTarget.checked)}
							label={
								<p>
									{t.rich(Auth.REGISTRATION_PRIVACY_OFFER_AGREEMENT, {
										processingLink: (chunks) => (
											<a href={OFFER_AGREEMENT_LINK} target="_blank" rel="noopener noreferrer">
												{chunks}
											</a>
										),
									})}
								</p>
							}
						/>
					)}
				</FormControl>
				<FormControl name="adConsent" control={control}>
					{(field) => (
						<Checkbox
							{...field}
							checked={Boolean(field.value)}
							onChange={(event) => field.onChange(event.currentTarget.checked)}
							label={
								<p>
									{t.rich(Auth.REGISTRATION_PRIVACY_ADD_CONSENT, {
										processingLink: (chunks) => (
											<a href={AD_CONSENT_LINK} target="_blank" rel="noopener noreferrer">
												{chunks}
											</a>
										),
									})}
								</p>
							}
						/>
					)}
				</FormControl>
			</div>
		</form>
	);
};
