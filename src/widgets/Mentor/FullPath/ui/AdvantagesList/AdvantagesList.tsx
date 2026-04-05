import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { community, material, structure } from '../../model/assets';
import { AdvantageItem } from '../../model/types/AdvantageItem';
import { AdvantageCard } from '../AdvantageCard/AdvantageCard';
import styles from './AdvantagesList.module.css';

export const AdvantagesList = () => {
	const t = useTranslations(i18Namespace.mentor);

	const FullPathCards: AdvantageItem[] = [
		{
			title: t(Mentor.FULLPATH_CARDS_MATERIAL_TITLE),
			description: t(Mentor.FULLPATH_CARDS_MATERIAL_DESCRIPTION),
			imageSrc: material,
		},
		{
			title: t(Mentor.FULLPATH_CARDS_COMMUNITY_TITLE),
			description: t(Mentor.FULLPATH_CARDS_COMMUNITY_DESCRIPTION),
			imageSrc: community,
		},
		{
			title: t(Mentor.FULLPATH_CARDS_STRUCTURE_TITLE),
			description: t(Mentor.FULLPATH_CARDS_STRUCTURE_DESCRIPTION),
			imageSrc: structure,
		},
	];
	return (
		<Flex className={styles['advantages-list']}>
			{FullPathCards.map((card) => (
				<AdvantageCard
					key={card.title}
					title={card.title}
					description={card.description}
					imageSrc={card.imageSrc}
				/>
			))}
		</Flex>
	);
};
