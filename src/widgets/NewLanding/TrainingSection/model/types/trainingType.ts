import { StaticImageData } from 'next/image';

type TrainingImg = {
	id: string;
	alt: string;
	src: StaticImageData;
	position: 'front' | 'back';
};

export type TrainingCardsProps = {
	id: string;
	title: string;
	description: string;
	images: TrainingImg[];
	to: string;
	disabled: boolean;
};

export type TrainingCardProps = TrainingCardsProps & {
	reverse: boolean;
	disabledText: string;
};
