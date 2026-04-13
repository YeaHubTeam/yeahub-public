import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { SectionHeader } from '@/widgets/Mentor/SectionHeader';

import { FeaturesList } from '../FeaturesList/FeaturesList';

export const FeaturesSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.FEATURES_INDICATOR)}
				title={t(Mentor.FEATURES_TITLE)}
				description={t(Mentor.FEATURES_DESCRIPTION)}
			/>
			<FeaturesList />
		</section>
	);
};
