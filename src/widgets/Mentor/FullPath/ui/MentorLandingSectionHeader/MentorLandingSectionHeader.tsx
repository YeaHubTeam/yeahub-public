import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MentorLandingSectionHeader.module.css';

const MentorLandingSectionHeader = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<div className={styles['full-path-header']}>
			<Flex align="center" gap="16" className={styles['indicator-wrapper']}>
				<span className={styles['indicator']}></span>
				<Text variant="body3">{t(Mentor.FULLPATH_INDICATOR)}</Text>
			</Flex>
			<Text variant="head3" className={styles['full-path-title']}>
				{t(Mentor.FULLPATH_TITLE)}
			</Text>
		</div>
	);
};

export default MentorLandingSectionHeader;
