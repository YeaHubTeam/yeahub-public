import { StaticImageData } from 'next/image';

import { Landing } from '@/shared/config';

import {
	androidDev,
	backend,
	dataScience,
	frontend,
	gameDev,
	iosDev,
	machineLearning,
	testing,
} from '../../model/assets';

export interface IMockSpeciality {
	id?: number;
	title: string;
	description: string;
	image: StaticImageData;
	alt?: string;
	link?: string;
}

export const mockSpecialization: Array<IMockSpeciality> = [
	{
		id: 1,
		title: 'Frontend',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_FRONTEND,
		image: frontend,
		alt: Landing.SPECIALIZATION_CARD_IMG_FRONTEND,
		link: '/questions/react-frontend-developer',
	},
	{
		id: 2,
		title: 'Backend',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_BACKEND,
		image: backend,
		alt: Landing.SPECIALIZATION_CARD_IMG_BACKEND,
		link: '/questions/nodejs-backend-developer',
	},
	{
		id: 3,
		title: 'Data Science',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_DATA,
		image: dataScience,
		alt: Landing.SPECIALIZATION_CARD_IMG_DATA,
		link: '/questions/data-scientist',
	},
	{
		id: 4,
		title: 'Machine Learning',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_MACHINE,
		image: machineLearning,
		alt: Landing.SPECIALIZATION_CARD_IMG_MACHINE,
		link: '/questions/machine-learning-engineer',
	},
	{
		id: 5,
		title: 'Testing',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_TESTING,
		image: testing,
		alt: Landing.SPECIALIZATION_CARD_IMG_TESTING,
		link: '/questions/qa-engineer',
	},
	{
		id: 6,
		title: 'iOS Dev',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_IOS,
		image: iosDev,
		alt: Landing.SPECIALIZATION_CARD_IMG_IOS,
		link: '/questions/ios-mobile-developer',
	},
	{
		id: 7,
		title: 'Android Dev',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_ANDROID,
		image: androidDev,
		alt: Landing.SPECIALIZATION_CARD_IMG_ANDROID,
		link: '/questions/android-mobile-developer',
	},
	{
		id: 8,
		title: 'Game Dev',
		description: Landing.SPECIALIZATION_CARD_DESCRIPTION_GAME,
		image: gameDev,
		alt: Landing.SPECIALIZATION_CARD_IMG_GAME,
		link: '/questions/game-developer',
	},
];
