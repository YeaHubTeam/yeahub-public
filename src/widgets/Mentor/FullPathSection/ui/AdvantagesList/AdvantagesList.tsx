import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';

import { community, material, structure } from '../../model/assets';
import { AdvantageItem } from '../../model/types/AdvantageItem';
import { AdvantageCard } from '../AdvantageCard/AdvantageCard';
import styles from './AdvantagesList.module.css';

export const AdvantagesList = () => {
	const t = useTranslations(i18Namespace.mentor);

	const FullPathCards: AdvantageItem[] = [
		{
			title: Mentor.FULLPATH_CARDS_MATERIAL_TITLE,
			description: Mentor.FULLPATH_CARDS_MATERIAL_DESCRIPTION,
			imageSrc: material,
			imgAlt: Mentor.FULLPATH_CARDS_MATERIAL_IMAGE_ALT,
		},
		{
			title: Mentor.FULLPATH_CARDS_COMMUNITY_TITLE,
			description: Mentor.FULLPATH_CARDS_COMMUNITY_DESCRIPTION,
			imageSrc: community,
			imgAlt: Mentor.FULLPATH_CARDS_COMMUNITY_IMAGE_ALT,
		},
		{
			title: Mentor.FULLPATH_CARDS_STRUCTURE_TITLE,
			description: Mentor.FULLPATH_CARDS_STRUCTURE_DESCRIPTION,
			imageSrc: structure,
			imgAlt: Mentor.FULLPATH_CARDS_STRUCTURE_IMAGE_ALT,
		},
	];
	return (
		<div className={styles['advantages-list']}>
			{FullPathCards.map((card) => (
				<AdvantageCard
					key={card.title}
					title={t(card.title)}
					description={t(card.description)}
					imageSrc={card.imageSrc}
					imgAlt={t(card.imgAlt)}
				/>
			))}
		</div>
	);
};
