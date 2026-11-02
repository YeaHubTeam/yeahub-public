import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { FeaturesList } from '../FeaturesList/FeaturesList';

interface FeaturesSectionProps {
	locale: string;
}

export const FeaturesSection = ({ locale }: FeaturesSectionProps) => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.FEATURES_INDICATOR)}
				title={t(MentorFullstack.FEATURES_TITLE)}
				description={t(MentorFullstack.FEATURES_DESCRIPTION)}
			/>
			<FeaturesList locale={locale} />
		</section>
	);
};
