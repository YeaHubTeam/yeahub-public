'use client';

import { useState } from 'react';

import { Answers } from '../types/quiz';

export const useSlideSwitcher = (questions: Answers[], initialSlideIndex?: number) => {
	const [currentQuestion, setCurrentQuestion] = useState(initialSlideIndex || 0);
	const answeredCount = questions.filter((question) => question.answer !== undefined).length;

	const goToNextSlide = () => {
		setCurrentQuestion((prev) => (prev === questions.length - 1 ? 0 : prev + 1));
	};

	const goToPrevSlide = () => {
		setCurrentQuestion((prev) => (prev === 0 ? questions.length - 1 : prev - 1));
	};

	return {
		...questions[currentQuestion],
		totalCount: questions.length,
		activeQuestion: currentQuestion + 1,
		answeredCount,
		goToNextSlide,
		goToPrevSlide,
	};
};
