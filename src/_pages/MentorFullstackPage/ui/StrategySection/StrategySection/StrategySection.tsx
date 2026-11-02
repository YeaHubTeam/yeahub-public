import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { StrategyList } from '../StrategyList/StrategyList';

export const StrategySection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.STRATEGY_INDICATOR)}
				title={t(MentorFullstack.STRATEGY_TITLE)}
				description={t(MentorFullstack.STRATEGY_DESCRIPTION)}
			/>
			<StrategyList />
		</section>
	);
};
