import { useTranslations } from 'next-intl';

import { GurusList, gurus } from '@/entities/guru';
import { Media, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

export const GurusBlock = () => {
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex direction="column" gap="12">
			<Text variant="head3">{t(Media.EXPERTS_TITLE)}</Text>
			<Text variant="body3">{t(Media.EXPERTS_DESCRIPTION)}</Text>
			<GurusList variant="list-with-borders" gurus={gurus} />
		</Flex>
	);
};
