import { featuresCards } from '../../model/constants/featuresCards';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import styles from './FeaturesList.module.css';

export const FeaturesList = () => {
	return (
		<div className={styles.list}>
			{featuresCards.map((item) => (
				<FeatureCard key={item.id} feature={item} />
			))}
		</div>
	);
};
