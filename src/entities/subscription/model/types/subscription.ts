export type SubscriptionCode = 'base' | 'free' | 'quarter' | 'year' | 'trial' | 'month';

export type SubscriptionPermission = {
	id: number;
	name: string;
};

export type SubscriptionRole = {
	id: number;
	name: string;
	permissions: SubscriptionPermission[];
};

export type Subscription = {
	id: number;
	name: string;
	code: SubscriptionCode;
	isActive: boolean;
	pricePerMonth: number;
	discount: number;
	monthPeriod: number;
	description: boolean;
	promo: string;
	roles: SubscriptionRole[];
	finalPrice: number;
};

export type GetSubscriptionsResponse = Subscription[];
