'use client';

import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import type { SignUpFormValues } from '@/entities/auth';
import { LoginLabel, RegisterForm } from '@/features/authentication/registration';
import { Auth, ROUTES, Translation, i18Namespace } from '@/shared/config';
import { Link, useRouter } from '@/shared/config/navigation';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { createRegisterSchema } from '../lib/validation/registerSchema';
import type { UserSchema } from '../model/types/userTypes';
import styles from './UserCreateForm.module.css';

interface UserCreateFormProps {
	registerAction?: (values: SignUpFormValues) => Promise<{
		status: 'success' | 'validation-error' | 'conflict' | 'error';
	}>;
}

export const UserCreateForm = ({ registerAction }: UserCreateFormProps) => {
	const tAuth = useTranslations(i18Namespace.auth);
	const [error, setError] = useState<string>();
	const [success, setSuccess] = useState(false);
	const [loginFailed, setLoginFailed] = useState(false);
	const [loggingIn, setLoggingIn] = useState(false);
	const router = useRouter();
	const pending = useRef(false);
	const completed = useRef(false);
	const active = useRef(false);
	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	const submit = async (values: SignUpFormValues) => {
		if (!registerAction || !active.current || pending.current || completed.current) return;
		pending.current = true;
		setError(undefined);
		try {
			const result = await registerAction(values);
			if (!active.current) return;
			if (result.status === 'success') {
				completed.current = true;
				methods.reset();
				setSuccess(true);
				setLoggingIn(true);
				try {
					const login = await signIn('credentials', {
						username: values.email,
						password: values.password,
						redirect: false,
					});
					if (!active.current) return;
					if (login?.ok && !login.error) {
						router.replace(ROUTES.appRoute);
						router.refresh();
					} else setLoginFailed(true);
				} catch {
					if (active.current) setLoginFailed(true);
				} finally {
					if (active.current) setLoggingIn(false);
				}
			} else
				setError(
					tAuth(
						result.status === 'conflict'
							? Auth.REGISTRATION_ERROR_CONFLICT
							: Auth.REGISTRATION_ERROR,
					),
				);
		} catch {
			if (active.current) setError(tAuth(Auth.REGISTRATION_ERROR));
		} finally {
			pending.current = false;
		}
	};
	const t = useTranslations(i18Namespace.translation);
	const registerSchema = createRegisterSchema({
		required: t(Translation.VALIDATION_REQUIRED),
		email: t(Translation.VALIDATION_EMAIL),
		minUsernameLength: t(Translation.VALIDATION_LENGTH_MIN, { count: 2 }),
		maxUsernameLength: t(Translation.VALIDATION_LENGTH_MAX, { count: 30 }),
		minPasswordLength: t(Translation.VALIDATION_LENGTH_MIN, { count: 8 }),
		maxPasswordLength: t(Translation.VALIDATION_LENGTH_MAX, { count: 255 }),
		passwordWeak: t(Translation.VALIDATION_PASSWORD_WEAK),
		passwordSimilar: t(Translation.VALIDATION_PASSWORD_SIMILAR),
		privacy: t(Translation.VALIDATION_PRIVACY),
	});
	const methods = useForm<UserSchema>({
		defaultValues: {
			username: '',
			email: '',
			password: '',
			passwordConfirmation: '',
			privacyConsent: false,
			offerConsent: false,
			adConsent: false,
		},
		resolver: yupResolver(registerSchema),
		mode: 'onTouched',
	});

	if (success)
		return (
			<div role="status" aria-busy={loggingIn}>
				<Text variant="body2">
					{tAuth(loginFailed ? Auth.REGISTRATION_LOGIN_FAILED : Auth.REGISTRATION_SUCCESS)}
				</Text>
				<Link href={ROUTES.auth.login.page}>
					<Text variant="body2">{tAuth(Auth.PASSWORD_RECOVERY_LOGIN_LINK)}</Text>
				</Link>
			</div>
		);

	return (
		<Flex direction="column" justify="between" align="center" className={styles.wrapper}>
			<Flex direction="column" gap="24">
				<FormProvider {...methods}>
					<RegisterForm onSubmit={registerAction ? submit : undefined} error={error} />
				</FormProvider>
			</Flex>
			<LoginLabel />
		</Flex>
	);
};
