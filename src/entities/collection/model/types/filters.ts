export interface CollectionsFilterParams {
	titleOrDescriptionSearch?: string;
	specialization?: number;
	isFree?: boolean | undefined;
	page?: number;
	authorId?: string;
	isMy?: boolean;
}
