import { StaticImageData } from 'next/image';

export interface CardData {
	id?: string;
	img: StaticImageData;
	imgClass: string;
	titleKey: string;
	descriptionKey: string;
	buttonKey: string;
	link: string;
}