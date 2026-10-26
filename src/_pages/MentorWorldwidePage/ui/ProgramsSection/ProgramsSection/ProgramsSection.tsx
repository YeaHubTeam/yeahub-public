import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { ProgramList } from '../ProgramList/ProgramList';

export const ProgramsSection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.PROGRAMS_LABEL)}
				title={t(MentorWorldwide.PROGRAMS_TITLE)}
				description={t(MentorWorldwide.PROGRAMS_DESCRIPTION)}
			/>
			<ProgramList />
		</section>
	);
};
