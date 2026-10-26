import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './PostpayNote.module.css';

export const PostpayNote = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<div className={styles.note}>
			<Text variant="body3-accent" color="black-700" className={styles.footnote}>
				{t(MentorWorldwide.PRICING_NOTE)}
			</Text>
			<Card className={styles.card} contentClassName={styles.content} withOutsideShadow>
				<Badge icon="lightning" wrapperClassName={styles.icon} />
				<Text variant="head3" className={styles.title}>
					{t(MentorWorldwide.PRICING_POSTPAY_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.description}>
					{t(MentorWorldwide.PRICING_POSTPAY_DESCRIPTION)}
				</Text>
			</Card>
		</div>
	);
};
