import type { Metadata } from 'next';

import PasswordRecoveryPage from '../../../_ui/PasswordRecoveryPage/PasswordRecoveryPage';
import { resetPassword } from './actions';

export const metadata: Metadata = {
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

interface PageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const Page = async ({ searchParams }: PageProps) => {
	const { token } = await searchParams;
	if (typeof token !== 'string' || !/^[a-fA-F0-9]{40}$/.test(token))
		return <PasswordRecoveryPage />;

	return <PasswordRecoveryPage resetPasswordAction={resetPassword.bind(null, token)} />;
};

export default Page;
