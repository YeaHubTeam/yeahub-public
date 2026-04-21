import { mentorPhone, mentorQuestions, mentors } from '@/shared/assets/images/mentor';
import { Mentor } from '@/shared/config';

export const strategyList = [
	{
		id: 'pack',
		title: Mentor.STRATEGY_ADVANTAGES_PACK_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_PACK_DESCRIPTION,
	},
	{
		id: 'ats',
		title: Mentor.STRATEGY_ADVANTAGES_ATS_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_ATS_DESCRIPTION,
		imgSrc: mentorPhone,
		imgAlt: Mentor.STRATEGY_ADVANTAGES_ATS_IMAGE_ALT,
	},
	{
		id: 'search',
		title: Mentor.STRATEGY_ADVANTAGES_SEARCH_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_SEARCH_DESCRIPTION,
	},
	{
		id: 'preparation',
		title: Mentor.STRATEGY_ADVANTAGES_PREPARATION_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_PREPARATION_DESCRIPTION,
		imgSrc: mentorQuestions,
		imgAlt: Mentor.STRATEGY_ADVANTAGES_PREPARATION_IMAGE_ALT,
	},
	{
		id: 'experience',
		title: Mentor.STRATEGY_ADVANTAGES_EXPERIENCE_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_EXPERIENCE_DESCRIPTION,
	},
	{
		id: 'motivation',
		title: Mentor.STRATEGY_ADVANTAGES_MOTIVATION_TITLE,
		description: Mentor.STRATEGY_ADVANTAGES_MOTIVATION_DESCRIPTION,
		imgSrc: mentors,
		imgAlt: Mentor.STRATEGY_ADVANTAGES_MOTIVATION_IMAGE_ALT,
	},
];
