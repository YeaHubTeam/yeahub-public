import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { FaqList } from '../FaqList/FaqList';

export const FaqSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.FAQ_INDICATOR)}
				title={t(MentorFullstack.FAQ_TITLE)}
				description={t(MentorFullstack.FAQ_DESCRIPTION)}
			/>
			<FaqList />
		</section>
	);
};
