'use client';

import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useLocale, useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { PasswordRecoveryForm } from '@/features/authentication/passwordRecovery';
import { Auth, ROUTES, Translation, i18Namespace } from '@/shared/config';
import { getPathname } from '@/shared/config/navigation';
import { Text } from '@/shared/ui/Text';

import { createPasswordRecoverySchema } from '../lib/validation/passwordRecoverySchema';

type ResetPasswordResult =
	| { status: 'success' }
	| { status: 'validation-error' }
	| { status: 'invalid-token' }
	| { status: 'error' };

interface PasswordRecoveryProps {
	resetPasswordAction: (password: string, confirmPassword: string) => Promise<ResetPasswordResult>;
}

export const PasswordRecovery = ({ resetPasswordAction }: PasswordRecoveryProps) => {
	const t = useTranslations(i18Namespace.auth);
	const validation = useTranslations(i18Namespace.translation);
	const locale = useLocale();
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string>();
	const active = useRef(false);
	const pending = useRef(false);
	const completed = useRef(false);
	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	const methods = useForm({
		defaultValues: { password: '', confirmPassword: '' },
		mode: 'onTouched',
		resolver: yupResolver(
			createPasswordRecoverySchema({
				required: validation(Translation.VALIDATION_REQUIRED),
				minPasswordLength: validation(Translation.VALIDATION_LENGTH_MIN, { count: 8 }),
				maxPasswordLength: validation(Translation.VALIDATION_LENGTH_MAX, { count: 255 }),
				passwordWeak: validation(Translation.VALIDATION_PASSWORD_WEAK),
				passwordSimilar: validation(Translation.VALIDATION_PASSWORD_SIMILAR),
			}),
		),
	});
	const submit = async (password: string, confirmPassword: string) => {
		if (!active.current || pending.current || completed.current) return;
		pending.current = true;
		setError(undefined);
		try {
			const result = await resetPasswordAction(password, confirmPassword);
			if (!active.current) return;
			if (result.status === 'success') {
				completed.current = true;
				methods.reset();
				setSuccess(true);
			} else
				setError(
					t(
						result.status === 'invalid-token'
							? Auth.PASSWORD_RECOVERY_TOKEN_EXPIRED
							: Auth.PASSWORD_RECOVERY_ERROR,
					),
				);
		} catch {
			if (active.current) setError(t(Auth.PASSWORD_RECOVERY_ERROR));
		} finally {
			pending.current = false;
		}
	};

	if (success)
		return (
			<div role="status">
				<Text variant="body2">{t(Auth.PASSWORD_RECOVERY_SUCCESS)}</Text>
				<a
					href={getPathname({ locale, href: ROUTES.auth.login.page })}
					referrerPolicy="no-referrer"
					rel="noreferrer"
				>
					<Text variant="body2">{t(Auth.PASSWORD_RECOVERY_LOGIN_LINK)}</Text>
				</a>
			</div>
		);
	return (
		<FormProvider {...methods}>
			<PasswordRecoveryForm onSubmit={submit} error={error} />
		</FormProvider>
	);
};
