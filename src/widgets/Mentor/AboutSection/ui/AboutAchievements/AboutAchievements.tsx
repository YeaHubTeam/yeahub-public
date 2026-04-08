import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AboutAchievements.module.css';

export const AboutAchievements = () => {
	const t = useTranslations(i18Namespace.mentor);

	const achievements = [
		{ id: 'first', text: t(Mentor.ABOUT_ACHIEVEMENTS_FIRST) },
		{ id: 'second', text: t(Mentor.ABOUT_ACHIEVEMENTS_SECOND) },
		{ id: 'third', text: t(Mentor.ABOUT_ACHIEVEMENTS_THIRD) },
		{ id: 'fourth', text: t(Mentor.ABOUT_ACHIEVEMENTS_FOURTH) },
		{ id: 'fifth', text: t(Mentor.ABOUT_ACHIEVEMENTS_FIFTH) },
		{ id: 'sixth', text: t(Mentor.ABOUT_ACHIEVEMENTS_SIXTH) },
	];

	return (
		<Card
			withOutsideShadow
			isActionPositionBottom
			actionTitle={t(Mentor.ABOUT_LINK)}
			actionRoute="#"
			actionPositionX="start"
			className={styles.wrapper}
			contentClassName={styles['wrapper-content']}
		>
			<Flex direction="column" gap="12">
				{achievements.map((item) => (
					<Flex gap="14" key={item.id}>
						<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
						<Text variant="body3-accent">{item.text}</Text>
					</Flex>
				))}
			</Flex>
		</Card>
	);
};
