import { useTranslations } from 'next-intl';

import { MentorWorldwide, ROUTES, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './ZeroExperienceBanner.module.css';

export const ZeroExperienceBanner = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<div className={styles.banner}>
			<span className={`${styles.glow} ${styles['deep-left']}`} aria-hidden="true" />
			<span className={`${styles.glow} ${styles.lavender}`} aria-hidden="true" />
			<span className={`${styles.glow} ${styles.violet}`} aria-hidden="true" />
			<Flex direction="column" align="start" gap="10" flex={1} className={styles.text}>
				<Text variant="head3" color="white-900" className={styles.title}>
					{t(MentorWorldwide.PRICING_BANNER_TITLE)}
				</Text>
				<Text variant="body3" color="white-900" className={styles.description}>
					{t(MentorWorldwide.PRICING_BANNER_DESCRIPTION)}
				</Text>
			</Flex>
			<Button
				variant="primary-inverse"
				size="large"
				className={styles.button}
				href={ROUTES['mentor-fullstack'].page}
				suffix={<Icon icon="arrowRight" size={24} color="purple-700" />}
			>
				<span className={styles['button-full']}>{t(MentorWorldwide.PRICING_BANNER_BUTTON)}</span>
				<span className={styles['button-short']}>
					{t(MentorWorldwide.PRICING_BANNER_BUTTON_SHORT)}
				</span>
			</Button>
		</div>
	);
};
