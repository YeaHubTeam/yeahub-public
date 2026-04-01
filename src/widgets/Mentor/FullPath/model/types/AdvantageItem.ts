import { StaticImageData } from 'next/image';

export interface AdvantageItem {
	title: string;
	description: string;
	imageSrc: string | StaticImageData;
}
