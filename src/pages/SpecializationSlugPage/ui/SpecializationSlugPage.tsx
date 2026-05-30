import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './SpecializationSlugPage.module.css';

interface SpecializationSlugPageProps {
	title: string;
	description: string;
}

export const SpecializationSlugPage = ({ title, description }: SpecializationSlugPageProps) => {
	return (
		<section className={styles.container}>
			<Flex>
				<BackButton size="x-large" />
			</Flex>
			<Text variant="head2" isMainTitle className={styles.title}>
				Подготовка к собеседованию:
				<br />
				{title}
			</Text>
			<Text variant="body3" className={styles.description}>
				{description}
			</Text>
		</section>
	);
};
