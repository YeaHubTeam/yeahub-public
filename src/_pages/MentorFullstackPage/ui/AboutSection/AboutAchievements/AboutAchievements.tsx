import { useTranslations } from 'next-intl';

import { MentorFullstack, ROUTES, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AboutAchievements.module.css';

export const AboutAchievements = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const achievements = [
		{ id: 'first', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_FIRST) },
		{ id: 'second', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_SECOND) },
		{ id: 'third', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_THIRD) },
		{ id: 'fourth', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_FOURTH) },
		{ id: 'fifth', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_FIFTH) },
		{ id: 'sixth', text: t(MentorFullstack.ABOUT_ACHIEVEMENTS_SIXTH) },
	];

	return (
		<Card
			withOutsideShadow
			isActionPositionBottom
			actionTitle={t(MentorFullstack.ABOUT_LINK)}
			actionRoute={ROUTES.mentor.experience}
			actionPositionX="start"
			className={styles.wrapper}
			contentClassName={styles['wrapper-content']}
			actionOptions={{
				target: '_blank',
				rel: 'noopener noreferrer',
			}}
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
