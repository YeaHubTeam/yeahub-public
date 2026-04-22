import { useTranslations } from 'next-intl';

import { Mentor, ROUTES, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { CommunityCard } from '../CommunityCard/CommunityCard';
import styles from './CommunityList.module.css';

interface CommunityItem {
	title: string;
	description: string;
	linkText: string;
	linkUrl: string;
}

export const CommunityList = () => {
	const t = useTranslations(i18Namespace.mentor);

	const communityItems: CommunityItem[] = [
		{
			title: t(Mentor.COMMUNITY_CARD_FRONTEND_TITLE),
			description: t(Mentor.COMMUNITY_CARD_FRONTEND_DESC),
			linkText: t(Mentor.COMMUNITY_CARD_FRONTEND_LINK),
			linkUrl: ROUTES.mentor.community,
		},
		{
			title: t(Mentor.COMMUNITY_CARD_NEWS_TITLE),
			description: t(Mentor.COMMUNITY_CARD_NEWS_DESC),
			linkText: t(Mentor.COMMUNITY_CARD_NEWS_LINK),
			linkUrl: ROUTES.mentor.news,
		},
		{
			title: t(Mentor.COMMUNITY_CARD_YOUTUBE_TITLE),
			description: t(Mentor.COMMUNITY_CARD_YOUTUBE_DESC),
			linkText: t(Mentor.COMMUNITY_CARD_YOUTUBE_LINK),
			linkUrl: ROUTES.mentor.youtube,
		},
		{
			title: t(Mentor.COMMUNITY_CARD_TELEGRAM_TITLE),
			description: t(Mentor.COMMUNITY_CARD_TELEGRAM_DESC),
			linkText: t(Mentor.COMMUNITY_CARD_TELEGRAM_LINK),
			linkUrl: ROUTES.mentor.telegramChannel,
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
		</Flex>
	);
};
