import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { EducationSteps } from '../EducationSteps/EducationSteps';

export const EducationSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.EDUCATION_LABEL)}
				title={t(MentorFullstack.EDUCATION_TITLE)}
				description={t(MentorFullstack.EDUCATION_DESCRIPTION)}
			/>
			<EducationSteps />
		</section>
	);
};
