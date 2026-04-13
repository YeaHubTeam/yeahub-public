import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MentorLandingSectionHeader.module.css';

const MentorLandingSectionHeader = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<div className={styles['pricing-header']}>
			<Flex align="center" gap="4" className={styles['indicator-wrapper']}>
				<span className={styles['indicator']}></span>
				<Text variant="body3">{t(Mentor.PRICING_INDICATOR)}</Text>
			</Flex>
			<Text variant="head3" className={styles['pricing-title']}>
				{t(Mentor.PRICING_TITLE)}
			</Text>
			<Text variant="body3-accent" className={styles['pricing-description']}>
				{t(Mentor.PRICING_DESCRIPTION)}
			</Text>
		</div>
	);
};

export default MentorLandingSectionHeader;
