import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BannerAdvantages.module.css';

export const BannerAdvantages = () => {
	const t = useTranslations(i18Namespace.mentor);

	const advantages = [
		{ id: 'first', text: t(Mentor.BANNER_ADVANTAGE_FIRST) },
		{ id: 'second', text: t(Mentor.BANNER_ADVANTAGE_SECOND) },
		{ id: 'third', text: t(Mentor.BANNER_ADVANTAGE_THIRD) },
		{ id: 'fourth', text: t(Mentor.BANNER_ADVANTAGE_FOURTH) },
	];

	return (
		<Flex gap="20" wrap="wrap" componentType="section" className={styles.list}>
			{advantages.map((item) => (
				<Card key={item.id} size="small" className={styles.card}>
					<Flex gap="9" align="start" className={styles['card-content']}>
						<Badge
							icon="lightning"
							wrapperClassName={styles['icon-wrapper']}
							className={styles.icon}
						/>
						<Text variant="body3-accent" className={styles['card-text']}>
							{item.text}
						</Text>
					</Flex>
				</Card>
			))}
		</Flex>
	);
};
