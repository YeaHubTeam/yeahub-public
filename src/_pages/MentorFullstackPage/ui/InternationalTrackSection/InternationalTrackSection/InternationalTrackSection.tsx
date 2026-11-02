import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './InternationalTrackSection.module.css';

export const InternationalTrackSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section className={styles.banner}>
			<span className={`${styles.glow} ${styles['deep-left']}`} aria-hidden="true" />
			<span className={`${styles.glow} ${styles.lavender}`} aria-hidden="true" />
			<span className={`${styles.glow} ${styles.violet}`} aria-hidden="true" />
			<Flex direction="column" align="start" gap="10" flex={1} className={styles.text}>
				<Text variant="head2" color="white-900" className={styles.title}>
					{t(MentorFullstack.INTERNATIONAL_TRACK_TITLE)}
				</Text>
				<Text variant="body3" color="white-900" className={styles.description}>
					{t(MentorFullstack.INTERNATIONAL_TRACK_DESCRIPTION)}
				</Text>
			</Flex>
			<Button
				variant="primary-inverse"
				size="large"
				className={styles.button}
				href={ROUTES['mentor-worldwide'].page}
				suffix={<Icon icon="arrowRight" size={24} color="purple-700" />}
			>
				{t(MentorFullstack.INTERNATIONAL_TRACK_BUTTON)}
			</Button>
		</section>
	);
};
