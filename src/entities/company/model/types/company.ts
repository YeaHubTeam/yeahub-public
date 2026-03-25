import { Author, Response } from '@/shared/libs';

export interface Company {
	id: string;
	title: string;
	legalName?: string | null;
	description?: string | null;
	imageSrc?: string | null;
	inn?: string | null;
	kpp?: string | null;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: Author;
}

export type GetCompaniesParamsRequest = {
	page?: number;
	limit?: number;
};
export type GetCompaniesResponse = Response<Company[]>;
