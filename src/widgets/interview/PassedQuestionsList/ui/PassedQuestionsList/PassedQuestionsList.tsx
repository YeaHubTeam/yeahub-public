'use client';

import { useSearchParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Answers } from '@/entities/quiz';
import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import { getQuestionLinks } from '../../lib/getQuestionLinks';
import { PassedQuestionsItem } from '../PassedQuestionsItem/PassedQuestionsItem';
import styles from './PassedQuestionsList.module.css';

export interface PassedQuestionsListProps {
	questions: Answers[];
	className?: string;
}

export const PassedQuestionsList = ({ questions, className }: PassedQuestionsListProps) => {
	const t = useTranslations(i18Namespace.interviewQuizResult);
	const searchParams = useSearchParams();
	const specializationId = Number(searchParams?.get('specializationId'));

	const questionLinks = getQuestionLinks(specializationId);

	return (
		<Card className={className} isTitleCenter title={t(InterviewQuizResult.TITLE_QUESTIONS_LIST)}>
			<ul className={styles.list}>
				{questions.map((question) => (
					<PassedQuestionsItem
						key={question.questionId}
						question={question}
						questionLink={questionLinks.get(question.questionId)}
					/>
				))}
			</ul>
		</Card>
	);
};
