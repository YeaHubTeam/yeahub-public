import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';

import { TrainingCards, cardDisabled } from '../../model/constants/trainingCards';
import { TrainingCard } from '../TrainingCard/TrainingCard';
import styles from './TrainingList.module.css';

export const TrainingList = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<div className={styles.grid}>
			{TrainingCards.map((card) => (
				<TrainingCard
					key={card.id}
					id={card.id}
					title={t(card.title)}
					description={t(card.description)}
					to={card.to}
					disabled={card.disabled}
					disabledText={t(cardDisabled)}
					images={card.images}
					reverse={card.id === 'mentor'}
				/>
			))}
		</div>
	);
};
