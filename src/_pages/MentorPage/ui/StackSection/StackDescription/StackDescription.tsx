import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './StackDescription.module.css';

export const StackDescription = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex direction="column" gap="26" className={styles['description-wrapper']}>
			<Text variant="body3-accent" className={styles.description}>
				{t(Mentor.STACK_DESCRIPTION_1)}
			</Text>
			<Text variant="body3-accent" className={styles.description}>
				{t(Mentor.STACK_DESCRIPTION_2)}
			</Text>
		</Flex>
	);
};
