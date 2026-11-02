import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { BannerAdvantageCard } from '../BannerAdvantageCard/BannerAdvantageCard';
import { BannerAdvantagesContent } from '../BannerAdvantagesContent/BannerAdvantagesContent';
import styles from './BannerAdvantages.module.css';

export const BannerAdvantages = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<Flex componentType="section" className={styles.section}>
			<Card withOutsideShadow className={styles.panel} contentClassName={styles.body}>
				<Flex className={styles.layout}>
					<BannerAdvantagesContent />
					<Flex className={styles.cards}>
						<BannerAdvantageCard
							variant="frontend"
							title={t(MentorFullstack.BANNER_ADVANTAGES_FRONTEND_TITLE)}
							items={[
								t(MentorFullstack.BANNER_ADVANTAGES_FRONTEND_SALARY),
								t(MentorFullstack.BANNER_ADVANTAGES_FRONTEND_COMPETITION),
							]}
							marketLabel={t(MentorFullstack.BANNER_ADVANTAGES_MARKET_VALUE)}
							value={t(MentorFullstack.BANNER_ADVANTAGES_FRONTEND_VALUE)}
						/>
						<BannerAdvantageCard
							variant="fullstack"
							title={t(MentorFullstack.BANNER_ADVANTAGES_FULLSTACK_TITLE)}
							items={[
								t(MentorFullstack.BANNER_ADVANTAGES_FULLSTACK_TEAM),
								t(MentorFullstack.BANNER_ADVANTAGES_FULLSTACK_SYSTEMS),
								t(MentorFullstack.BANNER_ADVANTAGES_FULLSTACK_PRICE),
							]}
							marketLabel={t(MentorFullstack.BANNER_ADVANTAGES_MARKET_VALUE)}
							value={t(MentorFullstack.BANNER_ADVANTAGES_FULLSTACK_VALUE)}
						/>
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
};
