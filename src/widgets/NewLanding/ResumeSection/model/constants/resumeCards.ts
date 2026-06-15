import { BeforAfter, CardVacancyOne, CardVacancyTwo, KeywordsContainer } from '@/shared/assets';
import { NewLanding, ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';

import { type ResumeCardProps } from '../types/resumeTypes';

export const resumeCards: ResumeCardProps[] = [
	{
		id: 'ats',
		title: NewLanding.RESUME_CARD_ATS_TITLE,
		description: NewLanding.RESUME_CARD_ATS_DESCRIPTION,
		images: [
			{
				id: 'beforAfter',
				alt: NewLanding.RESUME_CARD_ATS_IMG_ALT,
				src: BeforAfter,
			},
		],
		//Заменить путь на активный, и поменять флаг(disabled)
		to: route(ROUTES.learning.page),
		linkText: NewLanding.RESUME_CARD_ATS_BUTTON_LINK_TEXT,
		disabled: true,
		iconFlash: false,
		soon: true,
	},

	{
		id: 'keyWords',
		title: NewLanding.RESUME_CARD_KEYWORDS_TITLE,
		description: NewLanding.RESUME_CARD_KEYWORDS_DESCRIPTION,
		images: [
			{
				id: 'keywords',
				alt: NewLanding.RESUME_CARD_KEYWORDS_IMG_ALT,
				src: KeywordsContainer,
			},
		],
		linkText: NewLanding.RESUME_CARD_KEYWORDS_BUTTON_LINK_TEXT,
	},
	{
		id: 'vacancy',
		title: NewLanding.RESUME_CARD_VACANCY_TITLE,
		description: NewLanding.RESUME_CARD_VACANCY_DESCRIPTION,
		images: [
			{
				id: 'vacancyOne',
				alt: NewLanding.RESUME_CARD_VACANCY_IMG_ALT,
				src: CardVacancyOne,
			},
			{
				id: 'vacancyTwo',
				alt: NewLanding.RESUME_CARD_VACANCY_IMG_ALT,
				src: CardVacancyTwo,
			},
		],
		//Заменить путь на активный, и поменять флаг(disabled)
		to: route(ROUTES.learning.page),
		linkText: NewLanding.RESUME_CARD_VACANCY_BUTTON_LINK_TEXT,
		disabled: true,
		iconFlash: true,
		soon: true,
	},
];
