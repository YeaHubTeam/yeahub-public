import { useTranslations } from 'next-intl';

import { Learning, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AdvantagesBlock.module.css';
import { AdvantagesList } from './AdvantagesList/AdvantagesList';

export const AdvantagesBlock = () => {
	const t = useTranslations(i18Namespace.learning);
	return (
		<Flex gap="20" direction="column">
			<Flex direction="column" gap="8" className={styles.process}>
				<Text variant="head2" isMainTitle className={styles['main-text']}>
					{t(Learning.BANNER_TITLE)}
				</Text>
				<Text variant="body3" className={styles.description}>
					{t(Learning.BANNER_DESCRIPTION)}
				</Text>
			</Flex>
			<AdvantagesList />
		</Flex>
	);
};
