import { Landing, ROUTES } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';

import {
	materialsBackImg,
	materialsFrontImg,
	mentorBackImg,
	mentorFrontImg,
	roudmapImg,
} from '../assets';
import { TrainingCardsProps } from '../types/trainingType';

export const cardDisabled = Landing.TRAINING_CARD_DISABLED;
export const TrainingCards: TrainingCardsProps[] = [
	{
		id: 'roadmap',
		title: Landing.TRAINING_CARD_ROADMAP_TITLE,
		description: Landing.TRAINING_CARD_ROADMAP_DESCRIPTION,
		images: [
			{
				id: 'roadmapImg',
				alt: Landing.TRAINING_CARD_ROADMAP_IMG_ALT,
				src: roudmapImg,
				position: 'front',
			},
		],
		//Заменить путь на активный, и поменять флаг(disabled)
		to: route(ROUTES.learning.page),
		disabled: true,
	},
	{
		id: 'mentor',
		title: Landing.TRAINING_CARD_MENTOR_TITLE,
		description: Landing.TRAINING_CARD_MENTOR_DESCRIPTION,
		images: [
			{
				id: 'mentorFrontImg',
				alt: Landing.TRAINING_CARD_MENTOR_IMG_ALT,
				src: mentorFrontImg,
				position: 'front',
			},
			{
				id: 'mentorBackImg',
				alt: Landing.TRAINING_CARD_MENTOR_IMG_ALT,
				src: mentorBackImg,
				position: 'back',
			},
		],
		to: route(ROUTES.learning.page),
		disabled: false,
	},
	{
		id: 'materials',
		title: Landing.TRAINING_CARD_MATERIALS_TITLE,
		description: Landing.TRAINING_CARD_MATERIALS_DESCRIPTION,
		images: [
			{
				id: 'materialsFrontImg',
				alt: Landing.TRAINING_CARD_MATERIALS_IMG_ALT,
				src: materialsFrontImg,
				position: 'front',
			},
			{
				id: 'materialsBackImg',
				alt: Landing.TRAINING_CARD_MATERIALS_IMG_ALT,
				src: materialsBackImg,
				position: 'back',
			},
		],
		to: route(ROUTES.resources.page, DEFAULT_SPECIALIZATION_SLUG),
		disabled: false,
	},
];
