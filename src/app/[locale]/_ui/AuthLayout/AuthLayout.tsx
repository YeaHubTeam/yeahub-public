import type { ReactNode } from 'react';

import { ROUTES } from '@/shared/config';
import { AppLogo } from '@/shared/ui/AppLogo';
import { AuthAside } from '@/widgets/AuthLayout';

import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
	children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<div className={styles.container}>
			<AuthAside />
			<div className={styles['logo-wrapper']}>
				<AppLogo logoType="dark" navigateTo={ROUTES.interview.page} />
			</div>
			{children}
		</div>
	);
};
