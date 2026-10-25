import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './PricingExample.module.css';

export const PricingExample = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	const rows = [
		{
			label: t(MentorWorldwide.PRICING_EXAMPLE_PROGRAM),
			value: t(MentorWorldwide.PRICING_EXAMPLE_PROGRAM_PRICE),
		},
		{
			label: t(MentorWorldwide.PRICING_EXAMPLE_BLOCK),
			value: t(MentorWorldwide.PRICING_EXAMPLE_BLOCK_PRICE),
		},
	];

	return (
		<Card className={styles.card} contentClassName={styles.content} withOutsideShadow>
			<div className={styles.intro}>
				<Chip
					disablePointer
					label={t(MentorWorldwide.PRICING_START_BADGE)}
					className={styles.badge}
				/>
				<Text variant="head3" className={styles.title}>
					{t(MentorWorldwide.PRICING_START_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.description}>
					{t(MentorWorldwide.PRICING_START_DESCRIPTION)}
				</Text>
			</div>
			<div className={styles.calc}>
				<Text variant="body3-accent" color="black-500" className={styles['calc-title']}>
					{t(MentorWorldwide.PRICING_EXAMPLE_TITLE)}
				</Text>
				<Flex componentType="ul" direction="column" gap="12" className={styles.list}>
					{rows.map((row) => (
						<Flex key={row.label} componentType="li" align="center" gap="16" className={styles.row}>
							<Indicator />
							<Text variant="body3-accent" className={styles.label}>
								{row.label}
							</Text>
							<Text variant="body3-accent" className={styles.value}>
								{row.value}
							</Text>
						</Flex>
					))}
				</Flex>
				<div className={styles.summary}>
					<div className={styles.row}>
						<Text variant="body3-accent" className={styles.label}>
							{t(MentorWorldwide.PRICING_EXAMPLE_PREPAY)}
						</Text>
						<Text variant="body3-strong" color="purple-700" className={styles.total}>
							{t(MentorWorldwide.PRICING_EXAMPLE_PREPAY_PRICE)}
						</Text>
					</div>
					<div className={styles.row}>
						<Text variant="body3-accent" className={styles['sub-label']}>
							{t(MentorWorldwide.PRICING_EXAMPLE_POSTPAY)}
						</Text>
						<Text variant="body3" className={styles['sub-value']}>
							{t(MentorWorldwide.PRICING_EXAMPLE_POSTPAY_VALUE)}
						</Text>
					</div>
				</div>
			</div>
		</Card>
	);
};
