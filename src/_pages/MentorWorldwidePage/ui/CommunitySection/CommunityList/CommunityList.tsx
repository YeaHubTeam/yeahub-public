import { useTranslations } from 'next-intl';

import { MentorWorldwide, ROUTES, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BottomCommunityCard } from '../BottomCommunityCard/BottomCommunityCard';
import { CommunityCard } from '../CommunityCard/CommunityCard';
import styles from './CommunityList.module.css';

interface CommunityItem {
	title: string;
	description: string;
	linkText: string;
	linkUrl: string;
}

export const CommunityList = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	const communityItems: CommunityItem[] = [
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_FRONTEND_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_FRONTEND_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_FRONTEND_LINK),
			linkUrl: ROUTES.mentor.community,
		},
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_NEWS_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_NEWS_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_NEWS_LINK),
			linkUrl: ROUTES.mentor.news,
		},
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_YOUTUBE_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_YOUTUBE_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_YOUTUBE_LINK),
			linkUrl: ROUTES.mentor.youtube,
		},
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_TELEGRAM_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_TELEGRAM_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_TELEGRAM_LINK),
			linkUrl: ROUTES.mentor.telegramChannel,
		},
	];
	const bottomCommunityItems = [
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_HONESTY_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_HONESTY_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_HONESTY_LINK),
			linkUrl: ROUTES.mentor.honesty,
		},
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_INTERNSHIP_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_INTERNSHIP_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_INTERNSHIP_LINK),
			linkUrl: ROUTES.mentor.internship,
		},
		{
			title: t(MentorWorldwide.COMMUNITY_CARD_MEETUP_TITLE),
			description: t(MentorWorldwide.COMMUNITY_CARD_MEETUP_DESC),
			linkText: t(MentorWorldwide.COMMUNITY_CARD_MEETUP_LINK),
			linkUrl: ROUTES.mentor.meetup,
		},
	];

	return (
		<Flex className={styles['community-list']}>
			{communityItems.map((item) => (
				<CommunityCard
					key={item.title}
					title={item.title}
					description={item.description}
					linkText={item.linkText}
					linkUrl={item.linkUrl}
				/>
			))}
			{bottomCommunityItems.map((item) => (
				<BottomCommunityCard
					key={item.title}
					title={item.title}
					description={item.description}
					linkText={item.linkText}
					linkUrl={item.linkUrl}
				/>
			))}
		</Flex>
	);
};
