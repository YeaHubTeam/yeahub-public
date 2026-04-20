import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
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
			isInverted: false,
		},
	];

	return (
		<Flex wrap="wrap" gap="20" className={styles.list}>
			{rateCards.map((card) => (
				<TariffCard key={card.label} {...card} />
			))}
			<BonusesBlock />
		</Flex>
	);
};
