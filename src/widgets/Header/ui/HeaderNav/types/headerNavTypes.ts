export interface NavItem {
	id: string;
	href: string;
	path: string;
	label: string;
	columns?: {
		id: string;
		title: string;
		subitems: {
			name: string;
			href: string;
			path?: string;
		}[];
	}[];
}
