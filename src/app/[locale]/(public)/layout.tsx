import type { ReactNode } from 'react';

import { getTranslations } from 'next-intl/server';

import { Main, i18Namespace } from '@/shared/config';

import { PublicShell } from '../_ui/PublicShell';

interface PublicLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

const PublicLayout = async ({ children, params }: PublicLayoutProps) => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.main });

	const jsonLd = {
		'@context': 'http://schema.org/',
		'@type': 'WPHeader',
		headline: t(Main.PROJECT_TITLE),
	};

	return (
		<>
			<PublicShell>{children}</PublicShell>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			></script>
		</>
	);
};

export default PublicLayout;
