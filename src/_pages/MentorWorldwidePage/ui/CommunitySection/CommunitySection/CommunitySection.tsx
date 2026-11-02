import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { CommunityList } from '../CommunityList/CommunityList';

export const CommunitySection = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<section>
			<SectionHeader
				label={t(MentorWorldwide.COMMUNITY_INDICATOR)}
				title={t(MentorWorldwide.COMMUNITY_TITLE)}
				description={t(MentorWorldwide.COMMUNITY_DESCRIPTION)}
			/>
			<CommunityList />
		</section>
	);
};
