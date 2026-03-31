'use client';

import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { IconBadge } from '@/shared/ui/IconBadge';
import { Text } from '@/shared/ui/Text';

import styles from './MentorBannerAdvantages.module.css';

export const MentorBannerAdvantages = () => {
	const t = useTranslations(i18Namespace.mentor);

	const advantages = [
		{ id: 'first', text: t(Mentor.BANNER_ADVANTAGE_FIRST) },
		{ id: 'second', text: t(Mentor.BANNER_ADVANTAGE_SECOND) },
		{ id: 'third', text: t(Mentor.BANNER_ADVANTAGE_THIRD) },
		{ id: 'fourth', text: t(Mentor.BANNER_ADVANTAGE_FOURTH) },
	];

	return (
		<Flex gap="20" wrap="nowrap" className={styles.advantages} componentType="section">
			{advantages.map((item) => (
				<Card key={item.id} size="small" className={styles.card}>
					<Flex gap="9" align="center" className={styles['card-content']}>
						<IconBadge
							icon="lightning"
							className={styles['icon-wrapper']}
							iconClassName={styles.icon}
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
