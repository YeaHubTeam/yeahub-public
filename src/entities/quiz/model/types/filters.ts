import { QuestionModeType } from './quiz';

export interface CreateQuizFilterParams {
	skills?: number[];
	specialization?: number;
	complexity?: number[];
	limit?: number;
	mode?: QuestionModeType;
}
