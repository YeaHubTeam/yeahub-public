import { useTranslations } from 'next-intl';

import { gurus } from '@/entities/guru';
import MentorsBanner from '@/shared/assets/images/learning/mentorBanner.png';
import { Learning, i18Namespace } from '@/shared/config';
import { Banner } from '@/shared/ui/Banner';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { MentorCard } from '../MentorCard/MentorCard';
import styles from './MentorsBlock.module.css';

export const MentorsBlock = () => {
	const t = useTranslations(i18Namespace.learning);

	const mentorsWithPractice = gurus.filter((guru) => guru.hasPractice);

	return (
		<Flex direction="column" gap="20">
			<Card>
				<Flex direction="column" gap="20">
					<Flex direction="column" gap="8">
						<Text variant="head3" className={styles['main-text']}>
							{t(Learning.MENTORS_TITLE)}
						</Text>
						<Text variant="body3">{t(Learning.MENTORS_DESCRIPTION)}</Text>
					</Flex>

					<div className={styles.grid}>
						{mentorsWithPractice.map((guru) => (
							<MentorCard key={guru.name} guru={guru} />
						))}
					</div>
				</Flex>
			</Card>
			<Banner
				img={MentorsBanner}
				className={'alarm'}
				color="violet"
				description={t(Learning.MENTORS_BANNER)}
			/>
		</Flex>
	);
};
