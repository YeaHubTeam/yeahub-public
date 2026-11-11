'use client';

import { useRef, useSyncExternalStore } from 'react';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { LoginFormValues } from '@/entities/auth';
import { Auth, ROUTES, i18Namespace } from '@/shared/config';
import { useRouter } from '@/shared/config/navigation';
import { Button } from '@/shared/ui/Button';
import { FormControl } from '@/shared/ui/FormControl';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';

import styles from './LoginForm.module.css';

const subscribeToHydration = () => () => {};

export const LoginForm = () => {
	const hydrated = useSyncExternalStore(
		subscribeToHydration,
		() => true,
		() => false,
	);
	const router = useRouter();
	const t = useTranslations(i18Namespace.auth);
	const submitting = useRef(false);
	const {
		handleSubmit,
		control,
		setError,
		clearErrors,
		resetField,
		formState: { errors, isSubmitting },
	} = useFormContext<LoginFormValues>();

	const onLogin = async ({ username, password }: LoginFormValues) => {
		clearErrors('password');
		try {
			const result = await signIn('credentials', {
				username: username.trim(),
				password,
				redirect: false,
			});
			if (result?.ok && !result.error) {
				resetField('password', { defaultValue: '' });
				router.replace(ROUTES.appRoute);
				router.refresh();
				return;
			}
			const message =
				result?.error === 'CredentialsSignin'
					? t('login.error.credentials')
					: result &&
						  (result.status >= 500 ||
								result.error === 'Configuration' ||
								result.error === 'CallbackRouteError')
						? t('login.error.temporary')
						: t('login.error.unexpected');
			setError('password', { type: 'server', message });
		} catch (error) {
			setError('password', {
				type: 'server',
				message: t(error instanceof TypeError ? 'login.error.temporary' : 'login.error.unexpected'),
			});
		}
	};

	const handeleForgotPassword = () => {
		router.push(ROUTES.auth['forgot-password'].page);
	};

	return (
		<form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				if (submitting.current) return;
				submitting.current = true;
				void handleSubmit(onLogin)(event).finally(() => {
					submitting.current = false;
				});
			}}
			className={styles['form-wrapper']}
		>
			<div className={styles['input-wrapper']}>
				<FormControl name="username" control={control} label={t(Auth.FORM_EMAIL_LABEL)}>
					{(field, hasError) => (
						<Input
							{...field}
							onBlur={(event) => {
								field.onChange(event.currentTarget.value.trim());
								field.onBlur();
							}}
							className={styles.input}
							placeholder={t(Auth.FORM_EMAIL_PLACEHOLDER)}
							error={hasError}
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
				<div className={styles['forgot-password-link']}>
					<Button variant="link" onClick={handeleForgotPassword}>
						{t(Auth.LOGIN_FORGOT_PASSWORD_LINK)}
					</Button>
				</div>
			</div>
			<Button
				type="submit"
				variant="primary"
				disabled={!hydrated || isSubmitting}
				className={styles['submit-button']}
			>
				{t(Auth.LOGIN_SUBMIT)}
			</Button>
		</form>
	);
};
