import { FeatureCard } from '../FeatureCard/FeatureCard';
import { createFeaturesCards } from '../constants/featuresCards';
import styles from './FeaturesList.module.css';

interface FeaturesListProps {
	locale: string;
}

export const FeaturesList = ({ locale }: FeaturesListProps) => {
	const featuresCards = createFeaturesCards(locale);

	return (
		<div className={styles.list}>
			{featuresCards.map((item) => (
				<FeatureCard key={item.id} feature={item} />
			))}
		</div>
	);
};
