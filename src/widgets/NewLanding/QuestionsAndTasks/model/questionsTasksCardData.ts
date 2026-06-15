import { NewLanding } from "@/shared/config";
import { cardsImgQuestInfo } from '@/shared/assets';
import { cardsImgCollectInfo } from '@/shared/assets';
import { cardsImgTaskInfo } from '@/shared/assets';
import { CardData } from "./types";

export const cardsData: CardData[] = [
    {
        id: 'questions',
        img: cardsImgQuestInfo,
        imgClass: 'ImgQuest',
        titleKey: NewLanding.QUESTIONS_TASKS_CARD_QUESTIONS_TITLE,
        descriptionKey: NewLanding.QUESTIONS_TASKS_CARD_QUESTIONS_DESCRIPTION,
        buttonKey: NewLanding.QUESTIONS_TASKS_CARD_QUESTIONS_BUTTON,
        link: '/questions',
    },
    {
        id: 'tasks',
        img: cardsImgTaskInfo,
        imgClass: 'ImgTask',
        titleKey: NewLanding.QUESTIONS_TASKS_CARD_TASKS_TITLE,
        descriptionKey: NewLanding.QUESTIONS_TASKS_CARD_TASKS_DESCRIPTION,
        buttonKey: NewLanding.QUESTIONS_TASKS_CARD_TASKS_BUTTON,
        link: '/tasks',
    },
    {
        id: 'interviews',
        img: cardsImgCollectInfo,
        imgClass: 'ImgCollect',
        titleKey: NewLanding.QUESTIONS_TASKS_CARD_INTERVIEWS_TITLE,
        descriptionKey: NewLanding.QUESTIONS_TASKS_CARD_INTERVIEWS_DESCRIPTION,
        buttonKey: NewLanding.QUESTIONS_TASKS_CARD_INTERVIEWS_BUTTON,
        link: '/collections',
    },
];

