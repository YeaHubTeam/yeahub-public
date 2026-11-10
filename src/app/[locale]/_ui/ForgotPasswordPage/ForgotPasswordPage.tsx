import type { ComponentProps } from 'react';

import { getTranslations } from 'next-intl/server';

import { RegistrationLabel } from '@/entities/auth';
import { Auth, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { ForgotPassword } from '@/widgets/authentication/forgotPassword';

import styles from './ForgotPasswordPage.module.css';

type ForgotPasswordPageProps = Pick<ComponentProps<typeof ForgotPassword>, 'sendEmailAction'>;

const ForgotPasswordPage = async ({ sendEmailAction }: ForgotPasswordPageProps) => {
	const t = await getTranslations(i18Namespace.auth);

	return (
		<Flex className={styles.wrapper} justify="center" align="start">
			<Flex className={styles.content} direction="column" justify="between">
				<div>
					<Text variant="head2" isMainTitle className={styles.title}>
						{t(Auth.FORGOT_PASSWORD_TITLE)}
					</Text>
					<Text variant="body2" className={styles.subtitle}>
						{t(Auth.FORGOT_PASSWORD_SUBTITLE)}
					</Text>
					<ForgotPassword sendEmailAction={sendEmailAction} />
				</div>
				<div className={styles['registration-label-wrapper']}>
					<RegistrationLabel />
				</div>
			</Flex>
		</Flex>
	);
};

export default ForgotPasswordPage;
