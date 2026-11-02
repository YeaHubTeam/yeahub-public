import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { AboutAchievements } from '../AboutAchievements/AboutAchievements';
import { AboutProfile } from '../AboutProfile/AboutProfile';
import { AboutVideo } from '../AboutVideo/AboutVideo';
import styles from './AboutSection.module.css';

export const AboutSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section>
			<SectionHeader
				label={t(MentorFullstack.ABOUT_INDICATOR)}
				title={t(MentorFullstack.ABOUT_TITLE)}
				description={t(MentorFullstack.ABOUT_DESCRIPTION)}
			/>
			<div className={styles['wrapper']}>
				<AboutProfile />
				<AboutAchievements />
				<AboutVideo />
			</div>
		</section>
	);
};
