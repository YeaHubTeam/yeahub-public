import { useTranslations } from 'next-intl';

import ArrowRight from '@/shared/assets/icons/arrowRight.svg';
import { Docs, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { DockItem } from '../../model/types/types';

interface DocItemProps {
	doc: DockItem;
}

export const DocItem = ({ doc }: DocItemProps) => {
	const t = useTranslations(i18Namespace.docs);

	return (
		<Flex justify="between" align="center" gap="16">
			<Text variant="body3-accent">{t(doc.name)}</Text>
			<Button variant="link-purple" href={doc.link} target="_blank" style={{ minWidth: '90px' }}>
				{t(Docs.LINK)}
				<ArrowRight style={{ width: '20px', height: '20px' }} />
			</Button>
		</Flex>
	);
};
