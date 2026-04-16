import { Subscription } from '@/shared/config';

export interface SubscriptionInfoBenefit {
	title: string;
	isActive: boolean;
}

export const freeBenefits: SubscriptionInfoBenefit[] = [
	{
		title: Subscription.CARD_BENEFITS_FIRST,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_SECOND,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_THIRD,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_FIFTH,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_FOURTH,
		isActive: true,
	},
];

export const premiumBenefits: SubscriptionInfoBenefit[] = [
	{
		title: Subscription.CARD_BENEFITS_FIRST,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_SECOND,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_THIRD,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_FIFTH,
		isActive: true,
	},
	{
		title: Subscription.CARD_BENEFITS_FOURTH,
		isActive: true,
	},
];
