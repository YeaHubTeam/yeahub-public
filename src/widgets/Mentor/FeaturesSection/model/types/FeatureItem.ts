import { StaticImageData } from 'next/image';

export interface FeatureItem {
	id: string;
	badge: string;
	title: string;
	description: string;
	imageSrc?: string | StaticImageData;
	link: string;
	to: string;
	isHighlighted?: boolean;
}
