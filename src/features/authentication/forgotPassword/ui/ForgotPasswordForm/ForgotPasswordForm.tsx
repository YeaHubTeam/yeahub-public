'use client';

import { useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Auth, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { FormControl } from '@/shared/ui/FormControl';
import { Input } from '@/shared/ui/Input';
import { Text } from '@/shared/ui/Text';

import styles from './ForgotPasswordForm.module.css';

interface ForgotPasswordFormProps {
	onSubmit: (email: string) => Promise<void>;
	error?: string;
}

export const ForgotPasswordForm = ({ onSubmit, error }: ForgotPasswordFormProps) => {
	const t = useTranslations(i18Namespace.auth);
	const {
		control,
		handleSubmit,
		formState: { isValid, isSubmitting },
	} = useFormContext<{ username: string }>();
	const pending = useRef(false);
	const [failed, setFailed] = useState(false);
	const submit = async ({ username }: { username: string }) => {
		setFailed(false);
		try {
			await onSubmit(username.trim());
		} catch {
			setFailed(true);
		}
	};
	const message = error || (failed ? t(Auth.FORGOT_PASSWORD_ERROR) : undefined);

	return (
		<form
			method="post"
			noValidate
			className={styles.form}
			onSubmit={(event) => {
				event.preventDefault();
				if (pending.current) return;
				pending.current = true;
				void handleSubmit(submit)(event).finally(() => {
					pending.current = false;
				});
			}}
		>
			<div className={styles['input-wrapper']}>
				<FormControl name="username" control={control} label={t(Auth.FORM_EMAIL_LABEL)}>
					{(field, hasError) => (
						<Input
							{...field}
							id="username"
							autoComplete="email"
							className={styles.input}
							placeholder={t(Auth.FORM_EMAIL_PLACEHOLDER)}
							error={hasError}
							onBlur={(event) => {
								field.onChange(event.currentTarget.value.trim());
								field.onBlur();
							}}
						/>
					)}
				</FormControl>
			</div>
			{message && (
				<div role="alert">
					<Text variant="body1" color="red-700">
						{message}
					</Text>
				</div>
			)}
			<Button type="submit" disabled={!isValid || isSubmitting} aria-busy={isSubmitting} fullWidth>
				{t(Auth.FORGOT_PASSWORD_SUBMIT)}
			</Button>
		</form>
	);
};
