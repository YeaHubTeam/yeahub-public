'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import {
	LS_ACTIVE_MOCK_QUIZ_KEY,
	MockQuizQuestionAnswerType,
	QuestionNavPanel,
	checkAllQuestionsAnswered,
	useSlideSwitcher,
} from '@/entities/quiz';
import type { Answers } from '@/entities/quiz';
import { InterviewQuiz, ROUTES, i18Namespace } from '@/shared/config';
import { getJSONFromLS, removeFromLS, setToLS } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';
import { InterviewSlider } from '@/widgets/InterviewSlider';

import styles from './QuizPage.module.css';

export const QuizPage = () => {
	const t = useTranslations(i18Namespace.interviewQuiz);
	const [activeQuizQuestions, setActiveQuizQuestions] = useState<Answers[]>([]);
	const [isAnswerVisible, setIsAnswerVisible] = useState(false);

	const router = useRouter();

	useEffect(() => {
		const quizFromLS = getJSONFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);

		if (!quizFromLS) {
			router.replace(ROUTES.quiz.page);
		}

		const combinedQuestions =
			quizFromLS?.questions?.map((question: Question) => ({
				...question,
				questionId: question.id,
				questionTitle: question.title,
				answer: quizFromLS.response.answers.find((a: Answers) => a.questionId === question.id)
					?.answer,
			})) ?? [];
		setActiveQuizQuestions(combinedQuestions);
	}, []);

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
	} = useSlideSwitcher(activeQuizQuestions);

	const isAllQuestionsAnswered = checkAllQuestionsAnswered(activeQuizQuestions);
	const isLastQuestion = activeQuestion === totalCount;
	const isNextButton = !isLastQuestion && !isAllQuestionsAnswered;
	const isDisabled = (isLastQuestion && !isAllQuestionsAnswered) || (!isLastQuestion && !answer);

	const handleAnswerChange = (answer: MockQuizQuestionAnswerType) => {
		const updatedQuestions = activeQuizQuestions.map((question) => {
			return question.questionId === questionId ? { ...question, answer } : question;
		});
		const activeMockQuiz = getJSONFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
		const updatedAnswers = [...activeMockQuiz.response.answers];
		updatedAnswers[activeQuestion - 1] = {
			...updatedAnswers[activeQuestion - 1],
			answer,
		};
		const newMockData = {
			...activeMockQuiz,
			response: { ...activeMockQuiz.response, answers: updatedAnswers },
		};
		setToLS(LS_ACTIVE_MOCK_QUIZ_KEY, newMockData);
		setActiveQuizQuestions(updatedQuestions);
	};

	const onInterruptQuiz = () => {
		setActiveQuizQuestions([]);
		removeFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
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
					<Text variant="body5" isMainTitle>
						{t(InterviewQuiz.TITLE)}
					</Text>
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
