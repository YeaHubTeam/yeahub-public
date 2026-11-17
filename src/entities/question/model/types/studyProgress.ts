import type { QuestionPersonalStateResult } from './personalState';

export type QuestionStudyOperation = 'learn' | 'reset';
export type QuestionStudyInput = {
	questionId: number;
	expectedProfileId: string;
	operation: QuestionStudyOperation;
};
export type QuestionStudyResult = QuestionPersonalStateResult | {
	status: 'unverified' | 'premium-required' | 'progress-unavailable';
};
