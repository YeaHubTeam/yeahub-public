import { StaticImageData } from 'next/image';

export type ResumeImg = {
	id: string;
	alt: string;
	src: StaticImageData;
};

export type ResumeCardProps = {
	id: string;
	title: string;
	description: string;
	images: ResumeImg[];
	to?: string;
	linkText: string;
	disabled?: boolean;
	iconFlash?: boolean;
	soon?: boolean;
};
