import { StaticImageData } from 'next/image';

type BaseElement = {
	id: number;
	lightningIcon: boolean;
	title: string;
	description: string;
	imgBoolean?: false;
	imgPhone?: false;
};
type ElementWithImage = {
	id: number;
	lightningIcon: boolean;
	title: string;
	description: string;
	imgBoolean: true;
	imgPhone: boolean;
	imgSrc: StaticImageData;
	alt: string;
	heightMax?: number;
	heightMin?: number;
	widthMin?: number;
	widthMax?: number;
};

export type StrategyElement = BaseElement | ElementWithImage;
