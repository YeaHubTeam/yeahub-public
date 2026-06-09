import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { difficultesCards } from '../../model/constants';
import { DifficultyCard } from '../DifficultyCard/DifficultyCard';

export const DifficultyList = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex gap="20" wrap="wrap">
			{difficultesCards.map(({ title, description }, index) => (
				<DifficultyCard key={index} title={t(title)} description={t(description)} />
			))}
		</Flex>
	);
};
