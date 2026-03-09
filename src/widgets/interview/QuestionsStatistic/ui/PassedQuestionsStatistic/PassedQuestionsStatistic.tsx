import { useTranslations } from 'next-intl';

import { Answers, LS_ACTIVE_MOCK_QUIZ_KEY } from '@/entities/quiz';
import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { getJSONFromLS } from '@/shared/libs';
import { AdditionalStatInfoGauge } from '@/shared/ui/AdditionalStatInfoGauge';

import { getQuestionsStats } from '../../lib/getQuestionsStats/getQuestionsStats';

export interface PassedQuestionsStatisticProps {
	total: number;
	isLoading?: boolean;
	className?: string;
}

export const PassedQuestionsStatistic = ({
	total,
	isLoading,
	className,
}: PassedQuestionsStatisticProps) => {
	const t = useTranslations(i18Namespace.interviewStatistics);
	const tStatistic = useTranslations(i18Namespace.interviewQuizResult);

	const activeMockQuiz = getJSONFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
	const answers = activeMockQuiz.response.answers;
	const inProcessCount = answers.filter((el: Answers) => el.answer === 'UNKNOWN').length;
	const learnedCount = answers.filter((el: Answers) => el.answer === 'KNOWN').length;

	const statDate = {
		uniqueQuestionsCount: total,
		learnedQuestionsCount: learnedCount,
		unlearnedQuestionsCount: activeMockQuiz.fullCount,
		inProgressQuestionsCount: inProcessCount,
	};

	const questionStats = getQuestionsStats(t, statDate);

	return (
		<AdditionalStatInfoGauge
			isLoading={isLoading}
			className={className}
			title={tStatistic(InterviewQuizResult.INTERVIEW_STATISTIC_QUESTION)}
			statsInfo={questionStats}
			learned={statDate?.learnedQuestionsCount ?? 0}
			total={total ?? 0}
			withOutsideShadow
		/>
	);
};
