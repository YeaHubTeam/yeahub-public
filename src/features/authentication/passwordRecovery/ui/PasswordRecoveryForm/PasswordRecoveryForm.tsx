'use client';

import { useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Auth, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Text } from '@/shared/ui/Text';

import styles from './PasswordRecoveryForm.module.css';

type PasswordRecoveryFields = { password: string; confirmPassword: string };

interface PasswordRecoveryFormProps {
	onSubmit: (password: string, confirmPassword: string) => Promise<void>;
	error?: string | null;
}

export const PasswordRecoveryForm = ({ onSubmit, error }: PasswordRecoveryFormProps) => {
	const t = useTranslations(i18Namespace.auth);
	const {
		handleSubmit,
		formState: { errors, isValid, isSubmitting },
	} = useFormContext<PasswordRecoveryFields>();
	const pending = useRef(false);
	const [failed, setFailed] = useState(false);
	const submit = async ({ password, confirmPassword }: PasswordRecoveryFields) => {
		setFailed(false);
		try {
			await onSubmit(password, confirmPassword);
		} catch {
			setFailed(true);
		}
	};
	const message = error || (failed ? t(Auth.PASSWORD_RECOVERY_ERROR) : undefined);

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
				<PasswordInput
					name="password"
					label={t(Auth.PASSWORD_RECOVERY_NEW_PASSWORD_LABEL)}
					placeholder={t(Auth.FORM_PASSWORD_LABEL)}
					error={errors.password?.message}
				/>
			</div>
			<div className={styles['input-wrapper']}>
				<PasswordInput
					name="confirmPassword"
					label={t(Auth.PASSWORD_RECOVERY_CONFIRM_PASSWORD_LABEL)}
					placeholder={t(Auth.FORM_PASSWORD_LABEL)}
					error={errors.confirmPassword?.message}
				/>
			</div>
			{message && (
				<div role="alert">
					<Text variant="body1" color="red-700">
						{message}
					</Text>
				</div>
			)}
			<Button
				type="submit"
				className={styles['submit-button']}
				disabled={!isValid || isSubmitting}
				aria-busy={isSubmitting}
			>
				{t(Auth.PASSWORD_RECOVERY_SUBMIT)}
			</Button>
		</form>
	);
};
