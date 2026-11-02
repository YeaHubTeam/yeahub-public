import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { StrategyList } from '../StrategyList/StrategyList';

export const StrategySection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.STRATEGY_INDICATOR)}
				title={t(MentorWorldwide.STRATEGY_TITLE)}
				description={t(MentorWorldwide.STRATEGY_DESCRIPTION)}
			/>
			<StrategyList />
		</section>
	);
};
