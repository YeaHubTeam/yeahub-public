import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import offerImage from '../assets/offer.png';
import styles from './MarketOfferCard.module.css';

export const MarketOfferCard = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.content}>
			<div className={styles.top}>
				<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
				<Image
					src={offerImage}
					alt={t(MentorWorldwide.MARKET_OFFER_IMAGE_ALT)}
					className={styles.image}
					style={{ height: 'auto' }}
				/>
				<Flex direction="column" gap="4" className={styles.salary}>
					<Text variant="body3-accent" color="purple-700" className={styles.price}>
						{t(MentorWorldwide.MARKET_OFFER_PRICE)}
					</Text>
					<Text variant="body3" color="black-500" className={styles.note}>
						{t(MentorWorldwide.MARKET_OFFER_NOTE)}
					</Text>
				</Flex>
			</div>
			<Flex direction="column" gap="8" className={styles.texts}>
				<Text variant="head3" className={styles.title}>
					{t(MentorWorldwide.MARKET_OFFER_TITLE)}
				</Text>
				<Text variant="body3" className={styles.description}>
					{t(MentorWorldwide.MARKET_OFFER_DESCRIPTION)}
				</Text>
			</Flex>
		</Card>
	);
};
