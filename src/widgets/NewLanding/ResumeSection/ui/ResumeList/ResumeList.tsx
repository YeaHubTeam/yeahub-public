import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';

import { resumeCards } from '../../model/constants/resumeCards';
import ResumeCard from '../ResumeCard/ResumeCard';
import styles from './ResumeList.module.css';

const ResumeList = () => {
	const t = useTranslations(i18Namespace.newLanding);

	return (
		<div className={styles.grid}>
			{resumeCards.map((card) => (
				<ResumeCard
					key={card.id}
					id={card.id}
					title={t(card.title)}
					description={t(card.description)}
					to={card.to}
					disabled={card.disabled}
					linkText={t(card.linkText)}
					images={card.images}
					iconFlash={card.iconFlash}
					soon={card.soon}
				/>
			))}
		</div>
	);
};

export default ResumeList;
