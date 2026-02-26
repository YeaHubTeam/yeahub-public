import { Question } from '@/entities/question/@x/quiz';

export type QuestionModeType = 'REPEAT' | 'NEW' | 'RANDOM';
export type MockQuizQuestionAnswerType = 'KNOWN' | 'UNKNOWN';

export interface MockQuiz {
	startDate: string;
	fullCount: number;
	response: MockQuizResponse;
	questions: Question[];
}

export interface QuizResponse {
	answers: Answers[];
}

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

export interface MockQuizResponse {
	answers: Answers[];
}

export interface Answers {
	questionId: number;
	questionTitle: string;
	answer: MockQuizQuestionAnswerType;
	imageSrc?: string;
	shortAnswer: string;
}

export interface ActiveQuizState {
	questions: Answers[];
}

export interface CreateNewMockQuizParamsRequest {
	skills?: string;
	complexity?: string;
	collection?: number;
	limit?: number;
	mode?: QuestionModeType;
	specialization?: number;
}

export type CreateNewMockQuizResponse = MockQuiz;

export interface ChangeQuestionAnswerParams {
	questionId: number;
	answer: MockQuizQuestionAnswerType;
}

export interface ProfileSkillsStat {
	fullSkillsQuestionsMap: {
		skill: string;
		count: number;
	}[];
	learnedSkillsQuestionsMap: {
		skill: string;
		count: number;
	}[];
}

export interface ProgressByCategoriesData {
	category: string;
	passed: number;
	total: number;
	value: number;
}

export interface ProfileQuestionsStat {
	uniqueQuestionsCount: number;
	learnedQuestionsCount: number;
	unlearnedQuestionsCount: number;
	inProgressQuestionsCount: number;
}
