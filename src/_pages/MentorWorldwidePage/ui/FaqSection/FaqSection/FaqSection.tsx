import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { FaqList } from '../FaqList/FaqList';

export const FaqSection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.FAQ_INDICATOR)}
				title={t(MentorWorldwide.FAQ_TITLE)}
				description={t(MentorWorldwide.FAQ_DESCRIPTION)}
			/>
			<FaqList />
		</section>
	);
};
