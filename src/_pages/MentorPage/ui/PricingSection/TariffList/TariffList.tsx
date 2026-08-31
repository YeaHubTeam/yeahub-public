import { useTranslations } from 'next-intl';

import { FeatureCard } from '@/pages/MentorPage/ui/FeaturesSection/FeatureCard/FeatureCard';
import { TariffFullBuyoutCard } from '@/pages/MentorPage/ui/PricingSection/TariffFullBuyoutCard/TariffFullBuyoutCard';
import { Mentor, ROUTES, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BonusesBlock } from '../BonusesBlock/BonusesBlock';
import { TariffCard } from '../TariffCard/TariffCard';
import styles from './TariffList.module.css';

export const TariffList = () => {
	const t = useTranslations(i18Namespace.mentor);

	const rateCards = [
		{
			label: t(Mentor.PRICING_INTENSIVE_LABEL),
			price: t(Mentor.PRICING_INTENSIVE_PRICE),
			note: t(Mentor.PRICING_INTENSIVE_NOTE),
			details: t(Mentor.PRICING_INTENSIVE_DETAILS),
			features: [
				t(Mentor.PRICING_INTENSIVE_FOR_WHOM),
				t(Mentor.PRICING_INTENSIVE_PACE),
				t(Mentor.PRICING_INTENSIVE_FORMAT),
				t(Mentor.PRICING_INTENSIVE_STOPS),
			],
			buttonText: t(Mentor.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: false,
		},
		{
			label: t(Mentor.PRICING_SEQUENTIAL_LABEL),
			price: t(Mentor.PRICING_SEQUENTIAL_PRICE),
			note: t(Mentor.PRICING_SEQUENTIAL_NOTE),
			details: t(Mentor.PRICING_SEQUENTIAL_DETAILS),
			features: [
				t(Mentor.PRICING_SEQUENTIAL_FOR_WHOM),
				t(Mentor.PRICING_SEQUENTIAL_PACE),
				t(Mentor.PRICING_SEQUENTIAL_FORMAT),
				t(Mentor.PRICING_SEQUENTIAL_COMFORT),
			],
			buttonText: t(Mentor.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: true,
		},
		{
			label: t(Mentor.PRICING_DEEP_LABEL),
			price: t(Mentor.PRICING_DEEP_PRICE),
			note: t(Mentor.PRICING_DEEP_NOTE),
			details: t(Mentor.PRICING_DEEP_DETAILS),
			features: [
				t(Mentor.PRICING_DEEP_DEPTH),
				t(Mentor.PRICING_DEEP_COVERAGE),
				t(Mentor.PRICING_DEEP_CHECKS),
				t(Mentor.PRICING_DEEP_SUPPORT),
			],
			buttonText: t(Mentor.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: false,
		},
	];

	const fullBuyoutCard = {
		label: t(Mentor.PRICING_BUYOUT_LABEL),
		price: t(Mentor.PRICING_BUYOUT_PRICE),
		features: [t(Mentor.PRICING_BUYOUT_MODULES), t(Mentor.PRICING_BUYOUT_PAYMENT)],
		buttonText: t(Mentor.PRISING_CONSULTATION_BUTTON),
		link: ROUTES.mentor.telegram,
		promoTitle: t(Mentor.PRICING_BUYOUT_PROMO_TITLE),
		promoPrice: t(Mentor.PRICING_BUYOUT_PROMO_PRICE),
	};

	const featureCard = {
		id: 'pricing',
		badge: Mentor.PRICING_BUYOUT_0R_POSTPAY_BADGE,
		title: Mentor.PRICING_BUYOUT_0R_POSTPAY_TITLE,
		description: Mentor.PRICING_BUYOUT_0R_POSTPAY_DESCRIPTION,
	};

	return (
		<Flex wrap="wrap" gap="20" className={styles.list}>
			{rateCards.map((card) => (
				<TariffCard key={card.label} {...card} />
			))}
			<TariffFullBuyoutCard {...fullBuyoutCard} />
			<FeatureCard feature={featureCard} />
			<BonusesBlock />
		</Flex>
	);
};
