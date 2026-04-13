import { useTranslations } from 'next-intl';

import { InterviewQuiz, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';

import { MockQuizQuestionAnswerType } from '../../model/types/quiz';
import { ResponseButtons } from '../ResponseButtons/ResponseButtons';
import styles from './QuestionNavPanel.module.css';

interface QuestionNavPanelProps {
	answer?: MockQuizQuestionAnswerType;
	changeAnswer: (answer: MockQuizQuestionAnswerType) => void;
	showResponseButtons?: boolean;
	questionNumber: number;
	totalCount: number;
	goToNextSlide: () => void;
	goToPrevSlide: () => void;
}

export const QuestionNavPanel = ({
	answer,
	changeAnswer,
	showResponseButtons = false,
	questionNumber,
	totalCount,
	goToNextSlide,
	goToPrevSlide,
}: QuestionNavPanelProps) => {
	const t = useTranslations(i18Namespace.interviewQuiz);

	return (
		<Flex justify="between">
			<Flex className={styles['button-wrapper']}>
				<Button
					className={styles['nav-button']}
					onClick={goToPrevSlide}
					aria-label={t(InterviewQuiz.A11Y_PREV)}
					fullWidth
					suffix={<Icon icon="altArrowLeft" size={20} color="purple-700" />}
					variant="outline"
					disabled={questionNumber === 1}
				/>
			</Flex>
			{showResponseButtons && <ResponseButtons answer={answer} changeAnswer={changeAnswer} />}
			<Flex className={styles['button-wrapper']}>
				<Button
					className={styles['nav-button']}
					onClick={goToNextSlide}
					preffix={<Icon color="purple-700" icon="altArrowRight" size={20} />}
					fullWidth
					variant="outline"
					aria-label={t(InterviewQuiz.A11Y_NEXT)}
					disabled={questionNumber === totalCount || !answer}
				/>
			</Flex>
		</Flex>
	);
};
