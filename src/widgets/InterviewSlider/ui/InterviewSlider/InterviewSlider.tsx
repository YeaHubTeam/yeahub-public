import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { MockQuizQuestionAnswerType, ResponseButtons } from '@/entities/quiz';
import { InterviewQuiz, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import styles from './InterviewSlider.module.css';

interface InterviewSliderProps {
	id: number;
	title: string;
	imageSrc?: string;
	shortAnswer: string;
	answer?: string;
	changeAnswer: (answer: MockQuizQuestionAnswerType) => void;
	isAnswerVisible: boolean;
	setIsAnswerVisible: (value: boolean) => void;
}

export const InterviewSlider = ({
	id,
	title,
	imageSrc,
	answer,
	shortAnswer,
	changeAnswer,
	isAnswerVisible,
	setIsAnswerVisible,
}: InterviewSliderProps) => {
	const t = useTranslations(i18Namespace.interviewQuiz);

	const onToggleAnswerVisibility = () => {
		setIsAnswerVisible(!isAnswerVisible);
	};

	return (
		<article
			key={id}
			className={classNames(styles.slider, {
				[styles['slider-with-image']]: !!imageSrc,
				[styles['slider-without-image']]: !imageSrc,
			})}
		>
			<p className={styles.question}>{title}</p>
			<div className={styles.wrapper}>
				{!isAnswerVisible ? (
					<button className={styles.answer} onClick={onToggleAnswerVisibility}>
						{t(InterviewQuiz.ANSWER_SHOW)}
					</button>
				) : (
					<Flex direction="column" gap="16" className={styles['answer-wrapper']}>
						<Text variant="body3">{shortAnswer}</Text>
						<button className={styles.answer} onClick={onToggleAnswerVisibility}>
							{t(InterviewQuiz.ANSWER_HIDE)}
						</button>
					</Flex>
				)}
			</div>
			<ResponseButtons
				className={styles['response-buttons']}
				answer={answer}
				changeAnswer={changeAnswer}
			/>
			{imageSrc && <ImageWithWrapper src={imageSrc} alt={title} className={styles.image} />}
		</article>
	);
};
