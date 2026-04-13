import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { InfoCardPostpay } from '../InfoCardPostpay/InfoCardPostpay';
import { InfoCardSkilled } from '../InfoCardSkilled/InfoCardSkilled';
import styles from './InfoBlock.module.css';

export const InfoBlock = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex gap="20" wrap="wrap" className={styles['info-block']}>
			<InfoCardPostpay
				badge={t(Mentor.PRICING_INFO_BADGE_INSTEAD)}
				title={t(Mentor.PRICING_INFO_POSTPAY_TITLE)}
				description={t(Mentor.PRICING_INFO_POSTPAY_DESCRIPTION)}
				buttonText={t(Mentor.PRISING_CONSULTATION_BUTTON)}
			/>
			<InfoCardSkilled
				title={t(Mentor.PRICING_INFO_EXPERIENCED_TITLE)}
				description={t(Mentor.PRICING_INFO_EXPERIENCED_DESCRIPTION)}
				buttonText={t(Mentor.PRISING_CONSULTATION_BUTTON)}
				badgeInstead={t(Mentor.PRICING_INFO_BADGE_OFFER)}
				badgePostpay={t(Mentor.PRICING_INFO_BADGE_POSTPAY)}
			/>
		</Flex>
	);
};
