import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { EducationSteps } from '../EducationSteps/EducationSteps';

export const EducationSection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.EDUCATION_LABEL)}
				title={t(MentorWorldwide.EDUCATION_TITLE)}
				description={t(MentorWorldwide.EDUCATION_DESCRIPTION)}
			/>
			<EducationSteps />
		</section>
	);
};
