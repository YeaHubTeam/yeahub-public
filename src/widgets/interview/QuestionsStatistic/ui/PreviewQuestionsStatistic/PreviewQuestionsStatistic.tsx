import { useTranslations } from 'next-intl';

import { InterviewStatistics, i18Namespace } from '@/shared/config';
import { AdditionalStatInfoGauge } from '@/shared/ui/AdditionalStatInfoGauge';

export interface PreviewQuestionsStatisticProps {
	className?: string;
}

export const PreviewQuestionsStatistic = ({ className }: PreviewQuestionsStatisticProps) => {
	const tStats = useTranslations(i18Namespace.interviewStatistics);

	return (
		<AdditionalStatInfoGauge
			className={className}
			isActionPositionBottom
			title={tStats(InterviewStatistics.QUESTION_STATS_TITLE_SHORT)}
			actionTitle={'123'}
			actionRoute={'123'}
			actionDisabled={false}
			statsInfo={[]}
			total={0}
			learned={0}
		/>
	);
};
