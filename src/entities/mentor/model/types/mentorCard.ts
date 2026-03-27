import { StaticImageData } from 'next/image';

export interface mentorCard {
	title: string;
	description: string;
	imageSrc: string | StaticImageData;
}
