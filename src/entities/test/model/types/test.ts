import type { Question } from '@/entities/question/@x/test';

export type MockTestVariantKey = string;

export interface MockTestQuestion
	extends Pick<
		Question,
		| 'id'
		| 'title'
		| 'description'
		| 'imageSrc'
		| 'keywords'
		| 'status'
		| 'rate'
		| 'complexity'
		| 'createdAt'
		| 'updatedAt'
		| 'questionSpecializations'
		| 'questionSkills'
	> {
	variants: Record<MockTestVariantKey, string>;
}

export interface MockTestAnswer {
	questionId: number;
	questionTitle: string;
	answer: MockTestVariantKey[];
}

export interface MockTest {
	fullCount: number;
	skills: string[];
	questions: MockTestQuestion[];
	response: {
		answers: MockTestAnswer[];
	};
	startDate: string;
}

export interface CreateNewMockTestParamsRequest {
	specialization: number;
	skills?: string;
	complexity?: string;
	collection?: number;
	article?: number;
	limit?: number;
}

export type CreateNewMockTestResponse = MockTest;
