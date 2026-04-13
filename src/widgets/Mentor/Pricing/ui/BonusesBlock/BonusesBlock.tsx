import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BonusesBlock.module.css';

export const BonusesBlock = () => {
	const t = useTranslations(i18Namespace.mentor);

	const bonusesBlock = [
		[t(Mentor.PRICING_BONUSES_ALL_PROGRAMS), t(Mentor.PRICING_BONUSES_INTENSIVE_NOTE)],
		[t(Mentor.PRICING_BONUSES_MENTOR_INVOLVEMENT), t(Mentor.PRICING_BONUSES_MENTOR_INTEREST)],
	];

	return (
		<div className={styles['bonus-blocks']}>
			{bonusesBlock.map((block, index) => (
				<div key={index} className={styles['bonus-block']}>
					{block.map((line, lineIndex) => (
						<Flex key={lineIndex} gap="9" align="start" className={styles['bonus-block-text']}>
							<Badge
								icon="lightning"
								wrapperClassName={styles['icon-wrapper']}
								className={styles.icon}
							/>
							<Text variant="body3-accent" className={styles['bonus-text']}>
								{line}
							</Text>
						</Flex>
					))}
				</div>
			))}
		</div>
	);
};
