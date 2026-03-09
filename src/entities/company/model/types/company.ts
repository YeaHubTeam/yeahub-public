import { Author } from '@/shared/libs';

export interface Company {
	id: string | number;
	title?: string;
	legalName?: string | null;
	description?: string | null;
	imageSrc?: string | null;
	inn?: string | null;
	kpp?: string | null;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: Author;
}
