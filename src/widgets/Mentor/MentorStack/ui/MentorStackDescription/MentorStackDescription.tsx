import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MentorStackDescription.module.css';

interface MentorStackDescriptionProps {
	description1: string;
	description2: string;
}

export const MentorStackDescription = ({
	description1,
	description2,
}: MentorStackDescriptionProps) => {
	return (
		<Flex direction="column" gap="20" className={styles['description-wrapper']}>
			<Text variant="body3-accent" color="black-900" className={styles.description1}>
				{description1}
			</Text>
			<Text variant="body3-accent" color="black-900" className={styles.description2}>
				{description2}
			</Text>
		</Flex>
	);
};
