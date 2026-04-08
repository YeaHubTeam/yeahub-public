import { featuresCards } from '../constants/featuresCards';
import { FeatureItem } from '../types/FeatureItem';

type Translate = (key: string) => string;

export const mapFeaturesCards = (translate: Translate): FeatureItem[] => {
	return featuresCards.map(
		({ id, badge, title, description, imageSrc, link, to, isHighlighted }) => ({
			id,
			badge: translate(badge),
			title: translate(title),
			description: translate(description),
			link: translate(link),
			imageSrc,
			to,
			isHighlighted,
		}),
	);
};
