import type { ReactNode } from 'react';

import { getTranslations } from 'next-intl/server';

import CheckCircle from '@/shared/assets/icons/checkCircle1.svg';
import { AppLogo } from '@/shared/ui/AppLogo';
import { Text } from '@/shared/ui/Text';

import styles from './AuthLayout.module.css';

export const AuthLayout = async ({ children }: { children: ReactNode }) => {
	const t = await getTranslations('auth');
	const benefits = ['stepPlan', 'careerGrowth', 'community', 'mentors', 'internship'] as const;
	return (
		<div className={styles.container} data-testid="AuthLayout">
			<aside className={styles.aside} data-testid="AuthLayout_Aside">
				<div className={styles['aside-content']}>
					<div>
						<div className={styles.brand}>
							<AppLogo logoType="light" />
						</div>
						<Text variant="body3" color="white-900">
							{t('layout.tagline')}
						</Text>
					</div>
					<div>
						<Text variant="head3" color="white-900" className={styles['benefits-title']}>
							{t('layout.benefitsTitle')}
						</Text>
						<ul className={styles.benefits}>
							{benefits.map((benefit) => (
								<li key={benefit}>
									<CheckCircle width={18} height={18} aria-hidden="true" />
									<Text variant="body3" color="white-900">
										{t(`layout.${benefit}`)}
									</Text>
								</li>
							))}
						</ul>
					</div>
				</div>
			</aside>
			<div className={styles['mobile-logo']}>
				<AppLogo />
			</div>
			<main className={styles.main}>{children}</main>
		</div>
	);
};

export const AuthPage = ({
	children,
	variant = 'login',
}: {
	children: ReactNode;
	variant?: 'login' | 'register';
}) => <div className={`${styles.page} ${variant === 'login' ? styles.login : ''}`}>{children}</div>;
