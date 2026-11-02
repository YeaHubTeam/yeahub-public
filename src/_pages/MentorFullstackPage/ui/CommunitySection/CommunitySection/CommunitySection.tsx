import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { CommunityList } from '../CommunityList/CommunityList';

export const CommunitySection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.COMMUNITY_INDICATOR)}
				title={t(MentorFullstack.COMMUNITY_TITLE)}
				description={t(MentorFullstack.COMMUNITY_DESCRIPTION)}
			/>
			<CommunityList />
		</section>
	);
};
