import { useTranslations } from 'next-intl';

import { Specialization } from '@/entities/specialization';
import { Specializations, i18Namespace } from '@/shared/config';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './Header.module.css';

interface HeaderProps {
	specialization: Specialization;
}

export const Header = ({ specialization }: HeaderProps) => {
	const t = useTranslations(i18Namespace.specialization);

	return (
		<Flex componentType="section" align="start" gap="8" direction="column">
			<BackButton size="x-large" />
			<Flex direction="column" gap="20" className={styles.container}>
				<Text variant="head2" isMainTitle className={styles.title}>
					{t(Specializations.TITLE_DETAIL).toUpperCase()}
					<br />
					{specialization.title.toUpperCase()}
				</Text>
				<Text variant="body3" className={styles.description}>
					{specialization.description}
				</Text>
			</Flex>
		</Flex>
	);
};
