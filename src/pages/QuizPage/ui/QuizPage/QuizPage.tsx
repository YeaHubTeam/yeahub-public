'use client';

import { useEffect, useReducer, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import {
	LS_ACTIVE_MOCK_QUIZ_KEY,
	QuestionNavPanel,
	QuizQuestionAnswerType,
	checkAllQuestionsAnswered,
	combineQuizQuestions,
	readActiveMockQuiz,
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
import { QuizPageSkeleton } from './QuizPage.skeleton';

export const QuizPage = () => {
	const t = useTranslations(i18Namespace.interviewQuiz);
	const router = useRouter();

	const [isMounted, setIsMounted] = useState(false);
	const [isAnswerVisible, setIsAnswerVisible] = useState(false);

	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	const activeMockQuiz = isMounted ? readActiveMockQuiz() : null;
	const combinedQuestions = combineQuizQuestions(activeMockQuiz);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isMounted && !activeMockQuiz) {
			router.replace(ROUTES.quiz.page);
		}
	}, [isMounted, activeMockQuiz, router]);

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

	if (!isMounted || !activeMockQuiz) {
		return <QuizPageSkeleton />;
	}

	const isAllQuestionsAnswered = checkAllQuestionsAnswered(activeMockQuiz);
	const isLastQuestion = activeQuestion === totalCount;
	const isNextButton = !isLastQuestion && !isAllQuestionsAnswered;
	const isDisabled = (isLastQuestion && !isAllQuestionsAnswered) || (!isLastQuestion && !answer);

	const handleAnswerChange = (newAnswer: QuizQuestionAnswerType) => {
		const updatedAnswers = [...activeMockQuiz.response.answers];

		updatedAnswers[activeQuestion - 1] = {
			...updatedAnswers[activeQuestion - 1],
			answer: newAnswer,
		};

		const updatedQuiz: CreateNewMockQuizResponse = {
			...activeMockQuiz,
			response: {
				...activeMockQuiz.response,
				answers: updatedAnswers,
			},
		};

		localStorage.setItem(LS_ACTIVE_MOCK_QUIZ_KEY, JSON.stringify(updatedQuiz));

		forceUpdate();
	};

	const onInterruptQuiz = () => {
		localStorage.removeItem(LS_ACTIVE_MOCK_QUIZ_KEY);
		router.push(ROUTES.quiz.page);
	};

	const onPrevSlide = () => {
		setIsAnswerVisible(false);
		goToPrevSlide();
	};

	const onNextSlide = () => {
		setIsAnswerVisible(false);
		goToNextSlide();
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
						goToNextSlide={onNextSlide}
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
						<Button
							onClick={isNextButton ? onNextSlide : () => router.replace(ROUTES.quiz.result.page)}
							disabled={isDisabled}
						>
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
