'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import {
	Answers,
	QuestionNavPanel,
	QuizQuestionAnswerType,
	useSlideSwitcher,
} from '@/entities/quiz';
import type { CreateNewMockQuizResponse } from '@/entities/quiz';
import { InterviewQuiz, ROUTES, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';
import { InterviewSlider } from '@/widgets/InterviewSlider';

import styles from './QuizPage.module.css';

interface QuizPageProps {
	mockQuiz: CreateNewMockQuizResponse;
}

export const QuizPage = ({ mockQuiz }: QuizPageProps) => {
	const t = useTranslations(i18Namespace.interviewQuiz);
	const [activeMockQuiz, setActiveMockQuiz] = useState<CreateNewMockQuizResponse>(mockQuiz);
	const [isAnswerVisible, setIsAnswerVisible] = useState(false);

	const router = useRouter();

	const isAllQuestionsAnswered = activeMockQuiz?.response.answers.every(
		(question: Answers) => question.answer !== undefined && question.answer !== null,
	);

	const combinedQuestions = activeMockQuiz?.questions.map((question: Question) => ({
		...question,
		questionId: question.id,
		questionTitle: question.title,
		imageSrc: question.imageSrc ?? undefined,
		answer: activeMockQuiz.response.answers.find((a: Answers) => a.questionId === question.id)
			?.answer,
	}));

	const {
		questionId,
		questionTitle,
		imageSrc,
		shortAnswer,
		answeredCount,
		activeQuestion,
		totalCount,
		answer,
		goToNextSlide,
		goToPrevSlide,
	} = useSlideSwitcher(combinedQuestions);

	const onPrevSlide = () => {
		setIsAnswerVisible(false);
		goToPrevSlide();
	};

	const onRightSlide = () => {
		setIsAnswerVisible(false);
		goToNextSlide();
	};

	const onCheckQuizResult = () => {
		router.replace(ROUTES.quiz.result.page);
	};

	const isLastQuestion = activeQuestion === totalCount;
	const isNextButton = !isLastQuestion && !isAllQuestionsAnswered;
	const isDisabled = (isLastQuestion && !isAllQuestionsAnswered) || (!isLastQuestion && !answer);

	const handleAnswerChange = (newAnswer: QuizQuestionAnswerType) => {
		if (!activeMockQuiz) return;
		const updatedAnswers = [...activeMockQuiz.response.answers];

		updatedAnswers[activeQuestion - 1] = {
			...updatedAnswers[activeQuestion - 1],
			answer: newAnswer,
		};

		const newMockData = {
			...activeMockQuiz,
			response: { ...activeMockQuiz.response, answers: updatedAnswers },
		};

		setActiveMockQuiz(newMockData);
	};

	const onInterruptQuiz = () => {
		if (activeMockQuiz) {
			router.push(`${ROUTES.quiz.page}`);
		}
	};

	return (
		<Flex direction="column" gap="20" className={styles.container}>
			<Card withOutsideShadow>
				<div className={styles['progress-bar']}>
					<Text variant="body5">{t(InterviewQuiz.TITLE)}</Text>
					<Text variant="body2" color="black-500">
						{activeQuestion}/{totalCount}
					</Text>
					<ProgressBar
						className={styles['progress-component']}
						currentCount={answeredCount}
						totalCount={totalCount}
					/>
				</div>
			</Card>
			<Card withOutsideShadow>
				<Flex direction="column" gap="20" className={styles.question}>
					<QuestionNavPanel
						goToNextSlide={onRightSlide}
						goToPrevSlide={onPrevSlide}
						answer={answer}
						changeAnswer={handleAnswerChange}
						questionNumber={activeQuestion}
						totalCount={totalCount}
					/>
					<InterviewSlider
						id={questionId}
						title={questionTitle}
						imageSrc={imageSrc}
						shortAnswer={shortAnswer}
						answer={answer}
						changeAnswer={handleAnswerChange}
						isAnswerVisible={isAnswerVisible}
						setIsAnswerVisible={setIsAnswerVisible}
					/>
					<Flex direction="row">
						<Button onClick={isNextButton ? onRightSlide : onCheckQuizResult} disabled={isDisabled}>
							{isNextButton ? t(InterviewQuiz.NEXT) : t(InterviewQuiz.CHECK)}
						</Button>
						{isNextButton && (
							<Button className={styles['end-button']} onClick={onInterruptQuiz}>
								{t(InterviewQuiz.COMPLETE)}
							</Button>
						)}
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
};
