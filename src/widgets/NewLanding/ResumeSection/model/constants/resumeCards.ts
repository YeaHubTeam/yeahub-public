import { BeforAfter, CardVacancyOne, CardVacancyTwo, KeywordsContainer } from '@/shared/assets';
import { Landing, ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';

import { type ResumeCardProps } from '../types/resumeTypes';

export const resumeCards: ResumeCardProps[] = [
	{
		id: 'ats',
		title: Landing.RESUME_CARD_ATS_TITLE,
		description: Landing.RESUME_CARD_ATS_DESCRIPTION,
		images: [
			{
				id: 'before-after',
				alt: Landing.RESUME_CARD_ATS_IMG_ALT,
				src: BeforAfter,
			},
		],
		//Заменить путь на активный, и поменять флаг(disabled)
		to: route(ROUTES.learning.page),
		linkText: Landing.RESUME_CARD_ATS_BUTTON_LINK_TEXT,
		disabled: true,
		iconFlash: false,
		soon: true,
	},

	{
		id: 'keyWords',
		title: Landing.RESUME_CARD_KEYWORDS_TITLE,
		description: Landing.RESUME_CARD_KEYWORDS_DESCRIPTION,
		images: [
			{
				id: 'keywords',
				alt: Landing.RESUME_CARD_KEYWORDS_IMG_ALT,
				src: KeywordsContainer,
			},
		],
		linkText: Landing.RESUME_CARD_KEYWORDS_BUTTON_LINK_TEXT,
	},
	{
		id: 'vacancy',
		title: Landing.RESUME_CARD_VACANCY_TITLE,
		description: Landing.RESUME_CARD_VACANCY_DESCRIPTION,
		images: [
			{
				id: 'vacancy-one',
				alt: Landing.RESUME_CARD_VACANCY_IMG_ALT,
				src: CardVacancyOne,
			},
			{
				id: 'vacancy-two',
				alt: Landing.RESUME_CARD_VACANCY_IMG_ALT,
				src: CardVacancyTwo,
			},
		],
		//Заменить путь на активный, и поменять флаг(disabled)
		to: route(ROUTES.learning.page),
		linkText: Landing.RESUME_CARD_VACANCY_BUTTON_LINK_TEXT,
		disabled: true,
		iconFlash: true,
		soon: true,
	},
];
