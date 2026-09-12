import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import ResumeList from '../ResumeList/ResumeList';

export const ResumeSection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<SectionWrapper
			title={t(Landing.RESUME_TITLE).toUpperCase()}
			subtitle={t(Landing.RESUME_DESCRIPTION)}
		>
			<ResumeList />
		</SectionWrapper>
	);
};
