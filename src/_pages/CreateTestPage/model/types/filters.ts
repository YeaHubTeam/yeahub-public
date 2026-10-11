export type TestSelectionMode = 'REPEAT' | 'NEW' | 'RANDOM';

export interface CreateTestFilterParams {
	skills?: number[];
	specialization: number;
	complexity?: number[];
	limit?: number;
	mode: TestSelectionMode;
}
