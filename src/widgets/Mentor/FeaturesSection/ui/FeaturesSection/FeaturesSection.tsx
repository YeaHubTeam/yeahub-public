import { Flex } from '@/shared/ui/Flex';

import { FeaturesHeader } from '../FeaturesHeader/FeaturesHeader';
import { FeaturesList } from '../FeaturesList/FeaturesList';
import styles from './FeaturesSection.module.css';

export const FeaturesSection = () => {
	return (
		<Flex componentType="section" direction="column" gap="30" className={styles.block}>
			<FeaturesHeader />
			<FeaturesList />
		</Flex>
	);
};
