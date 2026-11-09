'use client';

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

export const LoginForm = () => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.auth);
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useFormContext<LoginFormValues>();

	const onLogin = (_data: LoginFormValues) => {
		// Auth API integration is deferred; validation only.
	};

	const handeleForgotPassword = () => {
		router.push(ROUTES.auth['forgot-password'].page);
	};

	return (
		<form
			onSubmit={(event) => {
				void handleSubmit(onLogin)(event);
			}}
			className={styles['form-wrapper']}
		>
			<div className={styles['input-wrapper']}>
				<FormControl name="username" control={control} label={t(Auth.FORM_EMAIL_LABEL)}>
					{(field, hasError) => (
						<Input
							{...field}
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
			<Button type="submit" variant="primary" disabled={false} className={styles['submit-button']}>
				{t(Auth.LOGIN_SUBMIT)}
			</Button>
		</form>
	);
};
