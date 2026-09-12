import Image from 'next/image';

import { useTranslations } from 'next-intl';

import ExperienceBanner from '@/shared/assets/images/learning/banner/experienceBanner.png';
import ProcessBanner from '@/shared/assets/images/learning/banner/processBanner.png';
import ProjectBanner from '@/shared/assets/images/learning/banner/projectBanner.png';
import SupportBanner from '@/shared/assets/images/learning/banner/supportBanner.png';
import TeamBanner from '@/shared/assets/images/learning/banner/teamBanner.png';
import TechnoBanner from '@/shared/assets/images/learning/banner/technoBanner.png';
import ExperienceIcon from '@/shared/assets/images/learning/icons/experienceIcon.png';
import ProcessIcon from '@/shared/assets/images/learning/icons/processIcon.png';
import ProjectIcon from '@/shared/assets/images/learning/icons/projectIcon.png';
import SupportIcon from '@/shared/assets/images/learning/icons/supportIcon.png';
import TeamIcon from '@/shared/assets/images/learning/icons/teamIcon.png';
import TechnoIcon from '@/shared/assets/images/learning/icons/technoIcon.png';
import { Learning, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './AdvantagesList.module.css';

export const AdvantagesList = () => {
	const t = useTranslations(i18Namespace.learning);
	const advantages = [
		{
			id: 1,
			icon: ProcessIcon,
			banner: ProcessBanner,
			title: t(Learning.PROCESS_TITLE),
			description: t(Learning.PROCESS_DESCRIPTION),
		},
		{
			id: 2,
			icon: TechnoIcon,
			banner: TechnoBanner,
			title: t(Learning.TECHNO_TITLE),
			description: t(Learning.TECHNO_DESCRIPTION),
		},
		{
			id: 3,
			icon: TeamIcon,
			banner: TeamBanner,
			title: t(Learning.TEAM_TITLE),
			description: t(Learning.TEAM_DESCRIPTION),
		},
		{
			id: 4,
			icon: SupportIcon,
			banner: SupportBanner,
			title: t(Learning.SUPPORT_TITLE),
			description: t(Learning.SUPPORT_DESCRIPTION),
		},
		{
			id: 5,
			icon: ProjectIcon,
			banner: ProjectBanner,
			title: t(Learning.PROJECT_TITLE),
			description: t(Learning.PROJECT_DESCRIPTION),
		},
		{
			id: 6,
			icon: ExperienceIcon,
			banner: ExperienceBanner,
			title: t(Learning.EXPERIENCE_TITLE),
			description: t(Learning.EXPERIENCE_DESCRIPTION),
		},
	];
	return (
		<Flex className={styles.container}>
			{advantages.map((item) => (
				<Card size="medium" key={item.id} className={styles['card-wrap']}>
					<Image src={item.icon} alt={item.title} className={styles.icon} />
					<Flex className={styles.card}>
						<Flex gap="8" direction="column">
							<Text variant="body5-strong">{item.title}</Text>
							<Text variant="body3-accent" className={styles.description}>
								{item.description}
							</Text>
						</Flex>
						<Flex justify="center">
							<Image src={item.banner} alt="personBanner" className={styles.banner} />
						</Flex>
					</Flex>
				</Card>
			))}
		</Flex>
	);
};
