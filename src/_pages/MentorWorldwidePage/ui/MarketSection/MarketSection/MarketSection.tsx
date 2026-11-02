import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { MarketList } from '../MarketList/MarketList';

export const MarketSection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.MARKET_INDICATOR)}
				title={t(MentorWorldwide.MARKET_TITLE)}
				description={t(MentorWorldwide.MARKET_DESCRIPTION)}
			/>
			<MarketList />
		</section>
	);
};
