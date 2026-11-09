import { getTranslations } from 'next-intl/server';

import { Auth, i18Namespace } from '@/shared/config';
import { AppLogo } from '@/shared/ui/AppLogo';
import { Text } from '@/shared/ui/Text';

import { BenefitsList } from '../BenefitsList/BenefitsList';
import styles from './AuthAside.module.css';

export const AuthAside = async () => {
	const t = await getTranslations(i18Namespace.auth);

	return (
		<aside className={styles.wrapper}>
			<div className={styles['content-wrapper']}>
				<div className={styles['logo']}>
					<div className={styles['logo-wrapper']}>
						<AppLogo logoType="light" />
					</div>
					<Text variant="body3" className={styles['logo-text']}>
						{t(Auth.LOGO_TEXT)}
					</Text>
				</div>
				<BenefitsList />
			</div>
		</aside>
	);
};
