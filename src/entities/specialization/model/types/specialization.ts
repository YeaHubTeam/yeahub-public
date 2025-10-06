import { Response } from '@/shared/types/types';

export interface Specialization {
	id: number;
	title: string;
	description: string;
	imageSrc?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export type GetSpecializationsListParamsRequest = {
	page?: number;
	title?: string;
	limit?: number;
	specializations?: number[];
};

export type GetSpecializationsListResponse = Response<Specialization[]>;
