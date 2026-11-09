'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { RegistrationLabel } from '@/entities/auth';
import { LoginForm } from '@/features/authentication/login';
import { Translation, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { createLoginSchema } from '../../lib/validation/loginSchema';
import type { LoginSchema } from '../../model/types/loginTypes';
import styles from './LoginCreateForm.module.css';

export const LoginCreateForm = () => {
	const t = useTranslations(i18Namespace.translation);
	const schema = createLoginSchema({
		email: t(Translation.VALIDATION_EMAIL),
		required: t(Translation.VALIDATION_REQUIRED),
	});
	const methods = useForm<LoginSchema>({
		resolver: yupResolver(schema),
		mode: 'onTouched',
	});
	return (
		<Flex direction="column" justify="between" className={styles.wrapper}>
			<Flex direction="column" className={styles.form}>
				<FormProvider {...methods}>
					<LoginForm />
				</FormProvider>
			</Flex>
			<RegistrationLabel />
		</Flex>
	);
};
