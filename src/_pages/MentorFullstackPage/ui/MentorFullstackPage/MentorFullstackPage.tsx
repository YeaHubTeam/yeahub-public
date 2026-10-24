import { useTranslations } from 'next-intl';

import { Header, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MentorFullstackPage.module.css';

export const MentorFullstackPage = () => {
	const t = useTranslations(i18Namespace.header);

	return (
		<Flex direction="column" gap="16" className={styles.page}>
			<Text variant="head1" isMainTitle>
				{t(Header.NAV_FULLSTACK)}
			</Text>
		</Flex>
	);
};
