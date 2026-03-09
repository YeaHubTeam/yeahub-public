import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Docs, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { DocsList } from '../DocsList/DocsList';

interface DocsPageProps {
	locale: string;
}

export const DocsPage = ({ locale }: DocsPageProps) => {
	setRequestLocale(locale);
	const t = useTranslations(i18Namespace.docs);

	return (
		<Card withOutsideShadow>
			<Flex direction="column" gap="40">
				<Text variant="body6" isMainTitle>
					{t(Docs.TITLE)}
				</Text>
				<DocsList />
			</Flex>
		</Card>
	);
};
