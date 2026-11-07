import type { ReactNode } from 'react';

import { AuthLayout } from '@/widgets/AuthLayout';

const AuthRouteLayout = ({ children }: { children: ReactNode }) => (
	<AuthLayout>{children}</AuthLayout>
);

export default AuthRouteLayout;
