import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';

import { mapFeaturesCards } from '../../model/helpers/mapFeaturesCards';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import styles from './FeaturesList.module.css';

export const FeaturesList = () => {
	const t = useTranslations(i18Namespace.mentor);

	const featureItems = mapFeaturesCards(t);

	return (
		<div className={styles.list}>
			{featureItems.map((item) => (
				<FeatureCard key={item.id} feature={item} />
			))}
		</div>
	);
};
