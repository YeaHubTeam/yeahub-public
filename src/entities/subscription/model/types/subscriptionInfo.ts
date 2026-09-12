import { Pallete } from '@/shared/libs';

import { SubscriptionInfoBenefit } from '../constants/benefitsConstants';
import { SubscriptionCode } from './subscription';

export interface SubscriptionInfo {
	id: number;
	code: SubscriptionCode;
	finalPrice: string;
	fullPrice: string;
	pricePerMonth: string;
	benefits: SubscriptionInfoBenefit[];
	badge: string;
	color: Pallete;
	title: string;
	trialInfo: string;
	subtitle: string;
}
