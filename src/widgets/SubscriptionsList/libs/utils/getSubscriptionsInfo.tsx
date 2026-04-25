import { SubscriptionInfo } from '../../model/types/types';
import { freeBenefits, premiumBenefits } from '../constants/benefitsConstants';

export const getSubscriptionsInfo = (): SubscriptionInfo[] => {
	const subscriptions: SubscriptionInfo[] = [
		{
			id: 1,
			code: 'month',
			title: '1 месяц',
			subtitle: 'Тариф «Простой»',
			trialInfo: 'Попробуйте 7 дней ПРО',
			finalPrice: '400 ₽',
			fullPrice: '800 ₽',
			pricePerMonth: '',
			color: 'purple-700',
			benefits: freeBenefits,
			badge: 'Базовый тариф',
			action: null,
		},
		{
			id: 2,
			code: 'quarter',
			title: '3 месяца',
			subtitle: 'Тариф «Оптимальный»',
			trialInfo: 'Попробуйте 7 дней ПРО',
			finalPrice: '1 000 ₽',
			fullPrice: '1 600 ₽',
			pricePerMonth: '333 ₽ / мес',
			color: 'yellow-800',
			benefits: premiumBenefits,
			badge: 'Экономия 16%',
			action: null,
		},
		{
			id: 3,
			code: 'year',
			title: '1 год',
			subtitle: 'Тариф «Все включено»',
			trialInfo: 'Попробуйте 7 дней ПРО',
			finalPrice: '3 600 ₽',
			fullPrice: '4 800 ₽',
			pricePerMonth: '300 ₽ / мес',
			color: 'green-750',
			benefits: premiumBenefits,
			badge: 'Экономия 25%',
			action: null,
		},
	];

	return subscriptions;
};
