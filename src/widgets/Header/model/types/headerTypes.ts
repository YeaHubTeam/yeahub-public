import { IconName } from '@/shared/ui/Icon';

export interface HeaderNavLinks {
	id: string;
	label: string;
	path?: string;
	link?: string;
}
export interface PopoverNavLink {
	title: string;
	link: string;
	path: string;
	icon: IconName;
}
export interface NavLink {
	id: string;
	title: string;
	subitems: PopoverNavLink[];
}
