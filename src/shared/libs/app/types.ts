export type SortOrder = 'ASC' | 'DESC';

export interface SelectedEntity<Id extends string | number> {
	id: Id;
	title?: string;
	disabled?: boolean;
}
export type SelectedEntities<Id extends string | number> = SelectedEntity<Id>[];
