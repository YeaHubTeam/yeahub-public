import { cardsImgQuestInfo } from '@/shared/assets';
import { cardsImgCollectInfo } from '@/shared/assets';
import { cardsImgTaskInfo } from '@/shared/assets';
import { Landing } from '@/shared/config';

import { CardData } from './types';

export const cardsData: CardData[] = [
	{
		id: 'questions',
		img: cardsImgQuestInfo,
		imgClass: 'img-quest',
		titleKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_QUESTIONS_TITLE,
		descriptionKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_QUESTIONS_DESCRIPTION,
		buttonKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_QUESTIONS_BUTTON,
		link: '/questions/react-frontend-developer',
	},
	{
		id: 'tasks',
		img: cardsImgTaskInfo,
		imgClass: 'img-task',
		titleKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_TASKS_TITLE,
		descriptionKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_TASKS_DESCRIPTION,
		buttonKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_TASKS_BUTTON,
		link: '/tasks',
	},
	{
		id: 'interviews',
		img: cardsImgCollectInfo,
		imgClass: 'img-collect',
		titleKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_INTERVIEWS_TITLE,
		descriptionKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_INTERVIEWS_DESCRIPTION,
		buttonKey: Landing.INTERVIEW_QUESTIONS_TASKS_CARD_INTERVIEWS_BUTTON,
		link: '/collections/react-frontend-developer',
	},
];
