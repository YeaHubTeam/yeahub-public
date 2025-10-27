import type { Specialization } from '@/entities/specialization/@x/skill';
import type { Response } from '@/shared/libs';

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
