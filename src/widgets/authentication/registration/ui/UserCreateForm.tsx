'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { LoginLabel, RegisterForm } from '@/features/authentication/registration';
import { Translation, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { createRegisterSchema } from '../lib/validation/registerSchema';
import type { UserSchema } from '../model/types/userTypes';
import styles from './UserCreateForm.module.css';

export const UserCreateForm = () => {
	const t = useTranslations(i18Namespace.translation);
	const registerSchema = createRegisterSchema({
		required: t(Translation.VALIDATION_REQUIRED),
		email: t(Translation.VALIDATION_EMAIL),
		minUsernameLength: t(Translation.VALIDATION_LENGTH_MIN, { count: 2 }),
		maxUsernameLength: t(Translation.VALIDATION_LENGTH_MAX, { count: 30 }),
		minPasswordLength: t(Translation.VALIDATION_LENGTH_MIN, { count: 8 }),
		passwordWeak: t(Translation.VALIDATION_PASSWORD_WEAK),
		passwordSimilar: t(Translation.VALIDATION_PASSWORD_SIMILAR),
		privacy: t(Translation.VALIDATION_PRIVACY),
	});
	const methods = useForm<UserSchema>({
		resolver: yupResolver(registerSchema),
		mode: 'onTouched',
	});

	return (
		<Flex direction="column" justify="between" align="center" className={styles.wrapper}>
			<Flex direction="column" gap="24">
				<FormProvider {...methods}>
					<RegisterForm />
				</FormProvider>
			</Flex>
			<LoginLabel />
		</Flex>
	);
};
