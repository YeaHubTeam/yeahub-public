import { Question } from '@/entities/question/@x/quiz';
import { Response } from '@/shared/libs';

export type QuestionModeType = 'REPEAT' | 'NEW' | 'RANDOM';
export type QuizQuestionAnswerType = 'KNOWN' | 'UNKNOWN';

export interface Quiz {
	id: string;
	profileId: string;
	quizNumber: number;
	startDate: string;
	endDate: string;
	fullCount: number;
	successCount: number;
	skills: string[];
	response: QuizResponse;
	questions: Question[];
}

export interface QuizResponse {
	answers: Answers[];
}

export interface Answers {
	questionId: number;
	questionTitle: string;
	answer?: QuizQuestionAnswerType;
	imageSrc?: string;
	shortAnswer: string;
	isFavorite?: boolean;
}

export interface ActiveQuizState {
	questions: Answers[];
}

export interface CreateNewQuizParamsRequest {
	profileId: string;
	skills?: string;
	complexity?: string;
	collection?: number;
	limit?: number;
	mode?: QuestionModeType;
}
export type ActiveQuiz = Omit<Quiz, 'endDate'>;

export type CreateNewQuizResponse = ActiveQuiz;

export interface CreateNewMockQuizParamsRequest
	extends Omit<CreateNewQuizParamsRequest, 'profileId'> {
	specialization?: number;
}

export type CreateNewMockQuizResponse = Omit<CreateNewQuizResponse, 'profileId'>;

export type GetActiveQuizResponse = Response<ActiveQuiz[]>;
export interface GetActiveQuizParamsRequest {
	profileId: string;
	page: number;
	limit: number;
}

export interface ChangeQuestionAnswerParams {
	questionId: number;
	profileId: string;
	answer: QuizQuestionAnswerType;
	shouldSaveToLS?: boolean;
}
