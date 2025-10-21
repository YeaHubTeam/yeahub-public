import type { IconComponent } from '@/shared/ui/Icon';

export interface Media {
	title: string;
	link: string;
	specializationId: number;
	image?: IconComponent;
}
