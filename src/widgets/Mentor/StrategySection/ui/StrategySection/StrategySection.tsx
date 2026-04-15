import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../../SectionHeader';
import { StrategyList } from '../StrategyList/StrategyList';

export const StrategySection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.STRATEGY_INDICATOR)}
				title={t(Mentor.STRATEGY_TITLE)}
				description={t(Mentor.STRATEGY_DESCRIPTION)}
			/>
			<StrategyList />
		</section>
	);
};
