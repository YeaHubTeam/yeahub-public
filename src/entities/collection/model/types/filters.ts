export interface CollectionsFilterParams {
	titleOrDescriptionSearch?: string;
	specialization?: number;
	companies?: string;
	isFree?: boolean | undefined;
	page?: number;
	authorId?: string;
	isMy?: boolean;
}
