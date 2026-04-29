import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Mentor, ROUTES, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { experience, processes, processesTablet, team } from '../../model/assets';
import styles from './AdvantagesList.module.css';

interface AdvantagesListProps {
	locale: string;
}

export const AdvantagesList = ({ locale }: AdvantagesListProps) => {
	const t = useTranslations(i18Namespace.mentor);

	const advantages = [
		{
			title: Mentor.INTERNSHIP_ADVANTAGES_PROCESSES_TITLE,
			description: Mentor.INTERNSHIP_ADVANTAGES_PROCESSES_DESCRIPTION,
			img: processes,
			additionalImage: processesTablet,
			imgAlt: Mentor.INTERNSHIP_ADVANTAGES_PROCESSES_IMAGE_ALT,
		},
		{
			title: Mentor.INTERNSHIP_ADVANTAGES_TEAM_TITLE,
			description: Mentor.INTERNSHIP_ADVANTAGES_TEAM_DESCRIPTION,
			link: Mentor.INTERNSHIP_ADVANTAGES_TEAM_LINK,
			route: `${ROUTES.mentor.yeaHubSite}/${locale}`,
			img: team,
			imgAlt: Mentor.INTERNSHIP_ADVANTAGES_TEAM_IMAGE_ALT,
		},
		{
			title: Mentor.INTERNSHIP_ADVANTAGES_EXPERIENCE_TITLE,
			description: Mentor.INTERNSHIP_ADVANTAGES_EXPERIENCE_LINK,
			link: Mentor.INTERNSHIP_ADVANTAGES_EXPERIENCE_LINK,
			route: ROUTES.mentor.yeaHubGithub,
			badge: Mentor.INTERNSHIP_ADVANTAGES_EXPERIENCE_BADGE,
			img: experience,
			imgAlt: Mentor.INTERNSHIP_ADVANTAGES_EXPERIENCE_IMAGE_ALT,
		},
	];

	return (
		<div className={styles.list}>
			{advantages.map((advantage) => (
				<Card
					key={advantage.title}
					actionTitle={advantage?.link ? t(advantage.link) : ''}
					actionRoute={advantage.route}
					actionPositionX="start"
					withOutsideShadow
					isActionPositionBottom
					className={styles.advantage}
					contentClassName={styles['advantage-content']}
					actionOptions={{
						target: '_blank',
						rel: 'noopener noreferrer',
					}}
				>
					{advantage.badge ? (
						<StatusChip size="medium" status={{ text: t(advantage.badge), variant: 'green' }} />
					) : (
						<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
					)}
					<Flex className={styles.content}>
						{!advantage.additionalImage ? (
							<Image
								src={advantage.img}
								alt={t(advantage.imgAlt)}
								className={styles.image}
								loading="lazy"
							/>
						) : (
							<>
								<Image
									src={advantage.img}
									alt={t(advantage.imgAlt)}
									className={classNames(styles.image, styles['main-image'])}
									loading="lazy"
								/>
								<Image
									src={advantage.additionalImage}
									alt={t(advantage.imgAlt)}
									className={classNames(styles.image, styles['additional-image'])}
									loading="lazy"
								/>
							</>
						)}
						<Flex direction="column" className={styles.texts}>
							<Text className={styles.title} variant="head3">
								{t(advantage.title)}
							</Text>
							<Text variant="body3">{t(advantage.description)}</Text>
						</Flex>
					</Flex>
				</Card>
			))}
		</div>
	);
};
