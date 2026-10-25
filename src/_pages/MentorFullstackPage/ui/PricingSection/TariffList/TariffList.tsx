import { useTranslations } from 'next-intl';

import { FeatureCard } from '@/pages/MentorFullstackPage/ui/FeaturesSection/FeatureCard/FeatureCard';
import { MentorFullstack, ROUTES, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BonusesBlock } from '../BonusesBlock/BonusesBlock';
import { TariffCard } from '../TariffCard/TariffCard';
import { TariffFullBuyoutCard } from '../TariffFullBuyoutCard/TariffFullBuyoutCard';
import styles from './TariffList.module.css';

export const TariffList = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const rateCards = [
		{
			label: t(MentorFullstack.PRICING_INTENSIVE_LABEL),
			price: t(MentorFullstack.PRICING_INTENSIVE_PRICE),
			note: t(MentorFullstack.PRICING_INTENSIVE_NOTE),
			details: t(MentorFullstack.PRICING_INTENSIVE_DETAILS),
			features: [
				t(MentorFullstack.PRICING_INTENSIVE_FOR_WHOM),
				t(MentorFullstack.PRICING_INTENSIVE_PACE),
				t(MentorFullstack.PRICING_INTENSIVE_FORMAT),
				t(MentorFullstack.PRICING_INTENSIVE_STOPS),
			],
			buttonText: t(MentorFullstack.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: false,
		},
		{
			label: t(MentorFullstack.PRICING_SEQUENTIAL_LABEL),
			price: t(MentorFullstack.PRICING_SEQUENTIAL_PRICE),
			note: t(MentorFullstack.PRICING_SEQUENTIAL_NOTE),
			details: t(MentorFullstack.PRICING_SEQUENTIAL_DETAILS),
			features: [
				t(MentorFullstack.PRICING_SEQUENTIAL_FOR_WHOM),
				t(MentorFullstack.PRICING_SEQUENTIAL_PACE),
				t(MentorFullstack.PRICING_SEQUENTIAL_FORMAT),
				t(MentorFullstack.PRICING_SEQUENTIAL_COMFORT),
			],
			buttonText: t(MentorFullstack.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: true,
		},
		{
			label: t(MentorFullstack.PRICING_DEEP_LABEL),
			price: t(MentorFullstack.PRICING_DEEP_PRICE),
			note: t(MentorFullstack.PRICING_DEEP_NOTE),
			details: t(MentorFullstack.PRICING_DEEP_DETAILS),
			features: [
				t(MentorFullstack.PRICING_DEEP_DEPTH),
				t(MentorFullstack.PRICING_DEEP_COVERAGE),
				t(MentorFullstack.PRICING_DEEP_CHECKS),
				t(MentorFullstack.PRICING_DEEP_SUPPORT),
			],
			buttonText: t(MentorFullstack.PRISING_CONSULTATION_BUTTON),
			link: ROUTES.mentor.telegram,
			isInverted: false,
		},
	];

	const fullBuyoutCard = {
		label: t(MentorFullstack.PRICING_BUYOUT_LABEL),
		price: t(MentorFullstack.PRICING_BUYOUT_PRICE),
		features: [
			t(MentorFullstack.PRICING_BUYOUT_MODULES),
			t(MentorFullstack.PRICING_BUYOUT_PAYMENT),
		],
		buttonText: t(MentorFullstack.PRISING_CONSULTATION_BUTTON),
		link: ROUTES.mentor.telegram,
		promoTitle: t(MentorFullstack.PRICING_BUYOUT_PROMO_TITLE),
		promoPrice: t(MentorFullstack.PRICING_BUYOUT_PROMO_PRICE),
	};

	const featureCard = {
		id: 'pricing',
		badge: MentorFullstack.PRICING_BUYOUT_0R_POSTPAY_BADGE,
		title: MentorFullstack.PRICING_BUYOUT_0R_POSTPAY_TITLE,
		description: MentorFullstack.PRICING_BUYOUT_0R_POSTPAY_DESCRIPTION,
	};

	return (
		<Flex wrap="wrap" gap="20" className={styles.list}>
			{rateCards.map((card) => (
				<TariffCard key={card.label} {...card} />
			))}
			<Flex maxWidth gap="20" className={styles['extra-tariff']}>
				<TariffFullBuyoutCard {...fullBuyoutCard} />
				<FeatureCard feature={featureCard} />
			</Flex>
			<BonusesBlock />
		</Flex>
	);
};
