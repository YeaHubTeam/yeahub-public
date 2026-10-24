import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BannerAdvantagesContent.module.css';

export const BannerAdvantagesContent = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<Flex direction="column" className={styles.column}>
			<Flex align="center" className={styles.label}>
				<Text variant="body3-accent" color="green-750">
					{t(MentorFullstack.BANNER_ADVANTAGES_LABEL)}
				</Text>
			</Flex>
			<Flex direction="column" gap="12" className={styles.text}>
				<Text variant="head3" className={styles.title}>
					{t(MentorFullstack.BANNER_ADVANTAGES_TITLE)}
				</Text>
				<Text variant="body3" color="black-500" className={styles.description}>
					{t(MentorFullstack.BANNER_ADVANTAGES_DESCRIPTION)}
				</Text>
			</Flex>
		</Flex>
	);
};
