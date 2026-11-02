import { MentorWorldwide, ROUTES } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';

import { interviews, questions } from '../assets';
import { FeatureItem } from '../types/FeatureItem';

export const createFeaturesCards = (locale: string): FeatureItem[] => [
	{
		id: 'questions',
		badge: MentorWorldwide.FEATURES_CARD_QUESTIONS_BADGE,
		title: MentorWorldwide.FEATURES_CARD_QUESTIONS_TITLE,
		description: MentorWorldwide.FEATURES_CARD_QUESTIONS_DESCRIPTION,
		imageSrc: questions,
		imgAlt: MentorWorldwide.FEATURES_CARD_QUESTIONS_IMAGE_ALT,
		link: MentorWorldwide.FEATURES_CARD_QUESTIONS_LINK,
		to: `/${locale}${route(ROUTES.questions.page, DEFAULT_SPECIALIZATION_SLUG)}`,
		isHighlighted: true,
	},
	{
		id: 'interviews',
		badge: MentorWorldwide.FEATURES_CARD_INTERVIEWS_BADGE,
		title: MentorWorldwide.FEATURES_CARD_INTERVIEWS_TITLE,
		description: MentorWorldwide.FEATURES_CARD_INTERVIEWS_DESCRIPTION,
		imageSrc: interviews,
		imgAlt: MentorWorldwide.FEATURES_CARD_INTERVIEWS_IMAGE_ALT,
		link: MentorWorldwide.FEATURES_CARD_INTERVIEWS_LINK,
		to: `/${locale}${route(ROUTES.collections.page, DEFAULT_SPECIALIZATION_SLUG)}`,
		isHighlighted: true,
	},
	{
		id: 'simulator',
		badge: MentorWorldwide.FEATURES_CARD_SIMULATOR_BADGE,
		title: MentorWorldwide.FEATURES_CARD_SIMULATOR_TITLE,
		description: MentorWorldwide.FEATURES_CARD_SIMULATOR_DESCRIPTION,
		link: MentorWorldwide.FEATURES_CARD_SIMULATOR_LINK,
		to: `/${locale}${route(ROUTES.quiz.new.page)}`,
	},
	{
		id: 'livecoding',
		badge: MentorWorldwide.FEATURES_CARD_LIVECODING_BADGE,
		title: MentorWorldwide.FEATURES_CARD_LIVECODING_TITLE,
		description: MentorWorldwide.FEATURES_CARD_LIVECODING_DESCRIPTION,
		link: MentorWorldwide.FEATURES_CARD_LIVECODING_LINK,
		to: ROUTES.tasks.external.page,
	},
	{
		id: 'analytics',
		badge: MentorWorldwide.FEATURES_CARD_ANALYTICS_BADGE,
		title: MentorWorldwide.FEATURES_CARD_ANALYTICS_TITLE,
		description: MentorWorldwide.FEATURES_CARD_ANALYTICS_DESCRIPTION,
		link: MentorWorldwide.FEATURES_CARD_ANALYTICS_LINK,
		to: `/${locale}${route(ROUTES.hhAnalytics.page)}`,
	},
];
