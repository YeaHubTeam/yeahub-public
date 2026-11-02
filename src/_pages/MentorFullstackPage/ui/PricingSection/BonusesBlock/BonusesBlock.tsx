import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BonusesBlock.module.css';

export const BonusesBlock = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const bonusesBlock = [
		[
			t(MentorFullstack.PRICING_BONUSES_ALL_PROGRAMS),
			t(MentorFullstack.PRICING_BONUSES_INTENSIVE_NOTE),
		],
		[
			t(MentorFullstack.PRICING_BONUSES_MENTOR_INVOLVEMENT),
			t(MentorFullstack.PRICING_BONUSES_MENTOR_INTEREST),
		],
	];

	return (
		<Flex gap="20" className={styles['bonus-blocks']}>
			{bonusesBlock.map((block, index) => (
				<Card withOutsideShadow key={index} className={styles['bonus-block']}>
					<Flex direction="column" gap="10" className={styles['bonus-block-content']}>
						{block.map((line, lineIndex) => (
							<Flex key={lineIndex} gap="9" align="start">
								<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
								<Text variant="body3-accent" className={styles.description}>
									{line}
								</Text>
							</Flex>
						))}
					</Flex>
				</Card>
			))}
		</Flex>
	);
};
