import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { FeaturesList } from '../FeaturesList/FeaturesList';

interface FeaturesSectionProps {
	locale: string;
}

export const FeaturesSection = ({ locale }: FeaturesSectionProps) => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.FEATURES_INDICATOR)}
				title={t(MentorWorldwide.FEATURES_TITLE)}
				description={t(MentorWorldwide.FEATURES_DESCRIPTION)}
			/>
			<FeaturesList locale={locale} />
		</section>
	);
};
