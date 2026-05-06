import { StaticImageData } from 'next/image';

export interface FeatureItem {
	id: string;
	badge: string;
	title: string;
	description: string;
	imageSrc?: string | StaticImageData;
	imgAlt?: string;
	link: string;
	to: string;
	isHighlighted?: boolean;
}
