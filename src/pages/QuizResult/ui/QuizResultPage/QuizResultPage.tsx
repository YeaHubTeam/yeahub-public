import { useTranslations } from 'next-intl';

import { GetQuestionsBySpecializationCountResponse } from '@/entities/question';
import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { QuizResultButton } from '@/widgets/Landing/QuizResultModal';
import { CategoryProgressList } from '@/widgets/interview/CategoryProgressList';
import { PassedQuestionsList } from '@/widgets/interview/PassedQuestionsList';
import { PassedQuestionsStatistic } from '@/widgets/interview/QuestionsStatistic';

import { useCalculationQuizResult } from '../../model/hooks/useCalculationQuizResult';
import { usePublicQuizResultData } from '../../model/hooks/usePublicQuizResultData';
import styles from './QuizResultPage.module.css';

export interface PublicQuizResultPageProps {
	quizResults: GetQuestionsBySpecializationCountResponse;
}

const PublicQuizResultPage = ({ quizResults }: PublicQuizResultPageProps) => {
	const { quizAnswers } = usePublicQuizResultData();
	const t = useTranslations(i18Namespace.interviewQuizResult);
	const { isMobile, isTablet } = useScreenSize();

	const skillsData = useCalculationQuizResult(quizResults);

	return (
		<Flex gap="20" direction="column">
			<Card
				title={t(InterviewQuizResult.INTERVIEW_STATISTIC_TITLE)}
				actionTitle={t(InterviewQuizResult.INTERVIEW_STATISTIC_LINK)}
				headerAction={<QuizResultButton />}
			>
				<Flex gap="20" direction={isTablet || isMobile ? 'column' : 'row'}>
					<PassedQuestionsStatistic total={quizResults.total} className={styles.statistic} />
					<CategoryProgressList
						title={t(InterviewQuizResult.INTERVIEW_STATISTIC_SCHEDULE)}
						className={styles.progress}
						skillsStat={skillsData?.skillStat}
					/>
				</Flex>
			</Card>
			<PassedQuestionsList className={styles['questions-list']} questions={quizAnswers || []} />
		</Flex>
	);
};

export default PublicQuizResultPage;
