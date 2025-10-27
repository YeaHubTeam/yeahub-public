import type { IconComponent } from '@/shared/ui/Icon';

export interface SocialMedia {
	title: string;
	link: string;
	specializationId: number;
	image?: IconComponent;
}
