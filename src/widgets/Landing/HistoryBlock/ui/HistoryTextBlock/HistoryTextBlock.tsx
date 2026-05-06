import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './HistoryTextBlock.module.css';

export const HistoryTextBlock = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex direction="column" justify="center" className={styles['text-block']}>
			<Flex direction="column" className={styles['content']}>
				<Text variant="head3" className={styles.title}>
					{t(Landing.HISTORY_TITLE)}
				</Text>
				<Text variant="body3">{t(Landing.HISTORY_SUBTITLE)}</Text>
			</Flex>
		</Flex>
	);
};
