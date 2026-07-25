import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../../SectionHeader';
import { CommunityList } from '../CommunityList/CommunityList';
import styles from './CommunitySection.module.css';

export const CommunitySection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.COMMUNITY_INDICATOR)}
				title={t(Mentor.COMMUNITY_TITLE)}
				description={t(Mentor.COMMUNITY_DESCRIPTION)}
				className={styles['section-header']}
			/>
			<CommunityList />
		</section>
	);
};
