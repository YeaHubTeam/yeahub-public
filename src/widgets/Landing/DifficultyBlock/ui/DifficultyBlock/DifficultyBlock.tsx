import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { DifficultyHeader } from '../DifficultyHeader/DifficultyHeader';
import { DifficultyList } from '../DifficultyList/DifficultyList';

export const DifficultyBlock = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<section>
			<Flex direction="column" gap="20">
				<DifficultyHeader
					title={t(Landing.DIFFICULTY_TITLE)}
					description={t(Landing.DIFFICULTY_DESCRIPTION)}
				/>
				<DifficultyList />
			</Flex>
		</section>
	);
};
