import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import { profileImage } from '../../model/assets';
import styles from './AboutProfile.module.css';

export const AboutProfile = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex direction="column" gap="20" className={styles['profile']}>
			<div className={styles['wrapper']}>
				<Image
					src={profileImage}
					alt={t(Mentor.ABOUT_PROFILE_NAME)}
					className={styles['img']}
					fill
				/>
			</div>
			<Flex direction="column" gap="8" className={styles['info']}>
				<Flex gap="16" align="center">
					<Indicator />
					<Text variant="body5-accent">{t(Mentor.ABOUT_PROFILE_NAME)}</Text>
				</Flex>
				<Text variant="body3">{t(Mentor.ABOUT_PROFILE_ROLE)}</Text>
			</Flex>
		</Flex>
	);
};
