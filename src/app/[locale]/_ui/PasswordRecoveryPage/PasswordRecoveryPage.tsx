import type { ComponentProps } from 'react';

import { getTranslations } from 'next-intl/server';

import { Auth, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { PasswordRecovery } from '@/widgets/authentication/passwordRecovery';

import styles from './PasswordRecoveryPage.module.css';

type PasswordRecoveryPageProps = Partial<
	Pick<ComponentProps<typeof PasswordRecovery>, 'resetPasswordAction'>
>;

const PasswordRecoveryPage = async ({ resetPasswordAction }: PasswordRecoveryPageProps) => {
	const t = await getTranslations(i18Namespace.auth);

	return (
		<Flex justify="center" align="center" className={styles.wrapper}>
			<Card className={styles.card}>
				<Text variant="head3" isMainTitle className={styles.title}>
					{t(Auth.PASSWORD_RECOVERY_TITLE)}
				</Text>
				{resetPasswordAction ? (
					<>
						<Text variant="body2" className={styles.subtitle}>
							{t(Auth.PASSWORD_RECOVERY_SUBTITLE)}
						</Text>
						<PasswordRecovery resetPasswordAction={resetPasswordAction} />
					</>
				) : (
					<Text variant="body2" color="red-700">
						{t(Auth.PASSWORD_RECOVERY_TOKEN_MISSING)}
					</Text>
				)}
			</Card>
		</Flex>
	);
};

export default PasswordRecoveryPage;
