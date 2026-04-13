import { Flex } from '@/shared/ui/Flex';

import { BonusesBlock } from '../BonusesBlock/BonusesBlock';
import MentorLandingSectionHeader from '../MentorLandingSectionHeader/MentorLandingSectionHeader';
import { RateList } from '../RateList/RateList';
import { InfoBlock } from '../infoBlock/InfoBlock';
import styles from './Pricing.module.css';

export const Pricing = () => {
	return (
		<section id={styles['pricing']}>
			<Flex direction="column" gap="20">
				<MentorLandingSectionHeader />
				<div className={styles['rate-with-bonuses']}>
					<RateList />
					<BonusesBlock />
				</div>
				<InfoBlock />
			</Flex>
		</section>
	);
};
