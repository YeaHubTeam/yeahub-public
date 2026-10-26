import { mentorPhone, mentorQuestions, mentors } from '@/shared/assets';
import { MentorWorldwide } from '@/shared/config';

export const strategyList = [
	{
		id: 'pack',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_PACK_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_PACK_DESCRIPTION,
	},
	{
		id: 'ats',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_ATS_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_ATS_DESCRIPTION,
		imgSrc: mentorPhone,
		imgAlt: MentorWorldwide.STRATEGY_ADVANTAGES_ATS_IMAGE_ALT,
	},
	{
		id: 'search',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_SEARCH_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_SEARCH_DESCRIPTION,
	},
	{
		id: 'preparation',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_PREPARATION_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_PREPARATION_DESCRIPTION,
		imgSrc: mentorQuestions,
		imgAlt: MentorWorldwide.STRATEGY_ADVANTAGES_PREPARATION_IMAGE_ALT,
	},
	{
		id: 'experience',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_EXPERIENCE_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_EXPERIENCE_DESCRIPTION,
	},
	{
		id: 'motivation',
		title: MentorWorldwide.STRATEGY_ADVANTAGES_MOTIVATION_TITLE,
		description: MentorWorldwide.STRATEGY_ADVANTAGES_MOTIVATION_DESCRIPTION,
		imgSrc: mentors,
		imgAlt: MentorWorldwide.STRATEGY_ADVANTAGES_MOTIVATION_IMAGE_ALT,
	},
];
