import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './CommunityHeader.module.css';

const CommunityHeader = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<div className={styles['community-header']}>
			<Flex align="center" gap="16" className={styles['indicator-wrapper']}>
				<span className={styles['indicator']}></span>
				<Text variant="body3">{t(Mentor.COMMUNITY_INDICATOR)}</Text>
			</Flex>

			<div className={styles['content-wrapper']}>
				<Text variant="head3" className={styles['community-title']}>
					{t(Mentor.COMMUNITY_TITLE)}
				</Text>

				<Text variant="body3" className={styles['community-description']}>
					{t(Mentor.COMMUNITY_DESCRIPTION)}
				</Text>
			</div>
		</div>
	);
};

export default CommunityHeader;
