import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { SectionHeader } from '@/widgets/Mentor/SectionHeader';

import { FeaturesList } from '../FeaturesList/FeaturesList';

interface FeaturesSectionProps {
	locale: string;
}

export const FeaturesSection = ({ locale }: FeaturesSectionProps) => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.FEATURES_INDICATOR)}
				title={t(Mentor.FEATURES_TITLE)}
				description={t(Mentor.FEATURES_DESCRIPTION)}
			/>
			<FeaturesList locale={locale} />
		</section>
	);
};
