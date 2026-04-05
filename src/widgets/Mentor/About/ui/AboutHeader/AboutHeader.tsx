import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AboutHeader.module.css';

export const AboutHeader = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<Flex className={styles['header']}>
			<Flex align="start">
				<Flex gap="16" align="center">
					<span className={styles['indicator']}></span>
					<Text variant="body3">{t(Mentor.ABOUT_INDICATOR)}</Text>
				</Flex>
			</Flex>

			<Flex gap="10" direction="column">
				<Text variant="head3" className={styles['title']}>
					{t(Mentor.ABOUT_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles['description']}>
					{t(Mentor.ABOUT_DESCRIPTION)}
				</Text>
			</Flex>
		</Flex>
	);
};
