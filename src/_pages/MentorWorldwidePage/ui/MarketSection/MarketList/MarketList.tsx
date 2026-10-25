import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';

import { MarketCard } from '../MarketCard/MarketCard';
import { MarketOfferCard } from '../MarketOfferCard/MarketOfferCard';
import { marketCards } from '../constants/marketCards';
import styles from './MarketList.module.css';

export const MarketList = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<ul className={styles.grid}>
			<li className={styles.offer}>
				<MarketOfferCard />
			</li>
			{marketCards.map((card) => (
				<li key={card.id} className={styles.item}>
					<MarketCard title={t(card.title)} description={t(card.description)} />
				</li>
			))}
		</ul>
	);
};
