import type { ReactNode } from 'react';

import { PublicShell } from '../_ui/PublicShell';

interface PublicLayoutProps {
	children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
	return <PublicShell>{children}</PublicShell>;
};

export default PublicLayout;
