import { useTranslations } from 'next-intl';

import { Media, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './GurusHeader.module.css';

export const GurusHeader = () => {
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex gap="8" align="center">
			<Icon icon="listWithBackground" size={40} color="purple-700" className={styles.icon} />
			<Text variant="body4" color="black-800">
				{t(Media.BANNER_DESCRIPTION)}
			</Text>
		</Flex>
	);
};
