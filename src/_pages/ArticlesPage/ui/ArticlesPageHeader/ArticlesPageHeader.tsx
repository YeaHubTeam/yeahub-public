import { useTranslations } from 'next-intl';

import { Articles, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './ArticlesPageHeader.module.css';

export const ArticlesPageHeader = () => {
	const t = useTranslations(i18Namespace.articles);
	const title = t(Articles.TITLE);
	const description = t(Articles.DESCRIPTION);

	return (
		<Flex direction="column" gap="8" className={styles.container}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{title}
			</Text>
			<Text variant="body3-accent" className={styles.subtitle}>
				{description}
			</Text>
		</Flex>
	);
};
