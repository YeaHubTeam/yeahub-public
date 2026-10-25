import { mentorPhone, mentorQuestions, mentors } from '@/shared/assets';
import { MentorFullstack } from '@/shared/config';

export const strategyList = [
	{
		id: 'pack',
		title: MentorFullstack.STRATEGY_ADVANTAGES_PACK_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_PACK_DESCRIPTION,
	},
	{
		id: 'ats',
		title: MentorFullstack.STRATEGY_ADVANTAGES_ATS_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_ATS_DESCRIPTION,
		imgSrc: mentorPhone,
		imgAlt: MentorFullstack.STRATEGY_ADVANTAGES_ATS_IMAGE_ALT,
	},
	{
		id: 'search',
		title: MentorFullstack.STRATEGY_ADVANTAGES_SEARCH_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_SEARCH_DESCRIPTION,
	},
	{
		id: 'preparation',
		title: MentorFullstack.STRATEGY_ADVANTAGES_PREPARATION_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_PREPARATION_DESCRIPTION,
		imgSrc: mentorQuestions,
		imgAlt: MentorFullstack.STRATEGY_ADVANTAGES_PREPARATION_IMAGE_ALT,
	},
	{
		id: 'experience',
		title: MentorFullstack.STRATEGY_ADVANTAGES_EXPERIENCE_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_EXPERIENCE_DESCRIPTION,
	},
	{
		id: 'motivation',
		title: MentorFullstack.STRATEGY_ADVANTAGES_MOTIVATION_TITLE,
		description: MentorFullstack.STRATEGY_ADVANTAGES_MOTIVATION_DESCRIPTION,
		imgSrc: mentors,
		imgAlt: MentorFullstack.STRATEGY_ADVANTAGES_MOTIVATION_IMAGE_ALT,
	},
];
