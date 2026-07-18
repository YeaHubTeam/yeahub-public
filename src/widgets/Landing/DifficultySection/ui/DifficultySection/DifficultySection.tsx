import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { DifficultyList } from '../DifficultyList/DifficultyList';

export const DifficultySection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<SectionWrapper
			title={t(Landing.DIFFICULTY_TITLE)}
			subtitle={t(Landing.DIFFICULTY_DESCRIPTION)}
		>
			<DifficultyList />
		</SectionWrapper>
	);
};
