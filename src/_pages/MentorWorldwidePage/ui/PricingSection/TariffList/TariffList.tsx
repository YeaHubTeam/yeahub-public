import { useTranslations } from 'next-intl';

import { MentorWorldwide, ROUTES, i18Namespace } from '@/shared/config';

import { PostpayNote } from '../PostpayNote/PostpayNote';
import { TariffCard } from '../TariffCard/TariffCard';
import styles from './TariffList.module.css';

export const TariffList = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	const cards = [
		{
			label: t(MentorWorldwide.PRICING_FLEXIBLE_LABEL),
			price: t(MentorWorldwide.PRICING_FLEXIBLE_PRICE),
			note: t(MentorWorldwide.PRICING_FLEXIBLE_NOTE),
			details: t(MentorWorldwide.PRICING_FLEXIBLE_DETAILS),
			features: [
				t(MentorWorldwide.PRICING_FLEXIBLE_START),
				t(MentorWorldwide.PRICING_FLEXIBLE_PARTS),
				t(MentorWorldwide.PRICING_FLEXIBLE_ALL),
				t(MentorWorldwide.PRICING_FLEXIBLE_INSURANCE),
			],
			isInverted: false,
		},
		{
			label: t(MentorWorldwide.PRICING_STANDARD_LABEL),
			price: t(MentorWorldwide.PRICING_STANDARD_PRICE),
			note: t(MentorWorldwide.PRICING_STANDARD_NOTE),
			details: t(MentorWorldwide.PRICING_STANDARD_DETAILS),
			features: [
				t(MentorWorldwide.PRICING_STANDARD_LESS),
				t(MentorWorldwide.PRICING_STANDARD_ALL),
				t(MentorWorldwide.PRICING_STANDARD_SUPPORT),
				t(MentorWorldwide.PRICING_STANDARD_INSURANCE),
			],
			isInverted: true,
		},
		{
			label: t(MentorWorldwide.PRICING_BUYOUT_LABEL),
			price: t(MentorWorldwide.PRICING_BUYOUT_PRICE),
			note: t(MentorWorldwide.PRICING_BUYOUT_NOTE),
			details: t(MentorWorldwide.PRICING_BUYOUT_DETAILS),
			features: [
				t(MentorWorldwide.PRICING_BUYOUT_NONE),
				t(MentorWorldwide.PRICING_BUYOUT_ALL),
				t(MentorWorldwide.PRICING_BUYOUT_SUPPORT),
				t(MentorWorldwide.PRICING_BUYOUT_INSURANCE),
			],
			isInverted: false,
		},
	];

	return (
		<div className={styles.list}>
			{cards.map((card) => (
				<TariffCard
					key={card.label}
					{...card}
					buttonText={t(MentorWorldwide.PRICING_BUTTON)}
					link={ROUTES.mentor.telegram}
				/>
			))}
			<PostpayNote />
		</div>
	);
};
