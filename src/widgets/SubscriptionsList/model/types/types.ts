import { ReactNode } from 'react';

import { Pallete } from '@/shared/libs';

import { SubscriptionInfoBenefit } from '../../libs/constants/benefitsConstants';

export interface SubscriptionInfo {
	id: number;
	code: 'month' | 'quarter' | 'year';
	finalPrice: string;
	fullPrice: string;
	pricePerMonth: string;
	benefits: SubscriptionInfoBenefit[];
	badge: string;
	color: Pallete;
	title: string;
	trialInfo: string;
	subtitle: string;
	action?: ReactNode;
}
