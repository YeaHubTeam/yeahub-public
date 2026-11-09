import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { AuthLayout } from '../../_ui/AuthLayout/AuthLayout';

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
		googleBot: {
			index: false,
			follow: false,
		},
	},
};

interface AuthRouteLayoutProps {
	children: ReactNode;
}

const AuthRouteLayout = ({ children }: AuthRouteLayoutProps) => {
	return <AuthLayout>{children}</AuthLayout>;
};

export default AuthRouteLayout;
