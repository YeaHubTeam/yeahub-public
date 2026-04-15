import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { EducationSteps } from '@/widgets/Mentor/EducationSection/ui/EducationSteps/EducationSteps';

import { SectionHeader } from '../../../SectionHeader';

export const EducationSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.EDUCATION_LABEL)}
				title={t(Mentor.EDUCATION_TITLE)}
				description={t(Mentor.EDUCATION_DESCRIPTION)}
			/>
			<EducationSteps />
		</section>
	);
};
