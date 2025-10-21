import type { Specialization } from '@/entities/specializations/@x/skills';
import type { Response } from '@/shared/types';

export interface Skill {
	id: number;
	title: string;
	description: string;
	imageSrc?: string | null;
	createdAt?: string;
	updatedAt?: string;
	specializations?: Specialization[];
}

export type GetSkillsListParamsRequest = {
	page?: number;
	title?: string;
	limit?: number;
	specializations?: number[];
};

export type GetSkillsListResponse = Response<Skill[]>;
