import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../../SectionHeader';
import { AdvantagesList } from '../AdvantagesList/AdvantagesList';

interface InternshipSectionProps {
	locale: string;
}

export const InternshipSection = ({ locale }: InternshipSectionProps) => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.INTERNSHIP_INDICATOR)}
				title={t(Mentor.INTERNSHIP_TITLE)}
				description={t(Mentor.INTERNSHIP_DESCRIPTION)}
			/>
			<AdvantagesList locale={locale} />
		</section>
	);
};
