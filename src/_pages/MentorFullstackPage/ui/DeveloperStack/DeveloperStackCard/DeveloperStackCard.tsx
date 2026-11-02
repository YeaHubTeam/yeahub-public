import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './DeveloperStackCard.module.css';

interface DeveloperStackCardProps {
	title: string;
	chips: string[];
}

export const DeveloperStackCard = ({ title, chips }: DeveloperStackCardProps) => {
	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.body}>
			<Flex align="center" gap="12" className={styles.header}>
				<Badge icon="lightning" wrapperClassName={styles.icon} />
				<Text variant="head3" className={styles.title}>
					{title}
				</Text>
			</Flex>
			<Flex wrap="wrap" gap="8" className={styles.chips}>
				{chips.map((chip) => (
					<Chip
						key={chip}
						label={chip}
						variant="small"
						theme="primary"
						disablePointer
						className={styles.chip}
					/>
				))}
			</Flex>
		</Card>
	);
};
