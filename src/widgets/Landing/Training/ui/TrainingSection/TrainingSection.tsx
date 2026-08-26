import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { TrainingList } from '../TrainingList/TrainingList';

export const TrainingSection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<SectionWrapper title={t(Landing.TRAINING_TITLE)} subtitle={t(Landing.TRAINING_DESCRIPTION)}>
			<TrainingList />
		</SectionWrapper>
	);
};
