import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';

import { DifficultyCard } from '../DifficultyCard/DifficultyCard';
import styles from './DifficultyList.module.css';

const difficultiesCards = [
	{
		title: Landing.DIFFICULTY_CARDS_FIRST_TITLE,
		description: Landing.DIFFICULTY_CARDS_FIRST_DESCRIPTION,
	},
	{
		title: Landing.DIFFICULTY_CARDS_SECOND_TITLE,
		description: Landing.DIFFICULTY_CARDS_SECOND_DESCRIPTION,
	},
	{
		title: Landing.DIFFICULTY_CARDS_THIRD_TITLE,
		description: Landing.DIFFICULTY_CARDS_THIRD_DESCRIPTION,
	},
	{
		title: Landing.DIFFICULTY_CARDS_FOURTH_TITLE,
		description: Landing.DIFFICULTY_CARDS_FOURTH_DESCRIPTION,
	},
	{
		title: Landing.DIFFICULTY_CARDS_FIFTH_TITLE,
		description: Landing.DIFFICULTY_CARDS_FIFTH_DESCRIPTION,
	},
	{
		title: Landing.DIFFICULTY_CARDS_SIXTH_TITLE,
		description: Landing.DIFFICULTY_CARDS_SIXTH_DESCRIPTION,
	},
];

export const DifficultyList = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<ul className={styles.list}>
			{difficultiesCards.map(({ title, description }, index) => (
				<li key={index}>
					<DifficultyCard title={t(title)} description={t(description)} />
				</li>
			))}
		</ul>
	);
};
