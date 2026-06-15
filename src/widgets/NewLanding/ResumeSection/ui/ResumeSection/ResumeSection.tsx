import { useTranslations } from 'next-intl';

import { NewLanding, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import ResumeList from '../ResumeList/ResumeList';

export const ResumeSection = () => {
	const t = useTranslations(i18Namespace.newLanding);

	return (
		<SectionWrapper
			title={t(NewLanding.RESUME_TITLE).toUpperCase()}
			subtitle={t(NewLanding.RESUME_DESCRIPTION)}
		>
			<ResumeList />
		</SectionWrapper>
	);
};
