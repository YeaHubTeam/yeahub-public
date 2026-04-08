import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { SectionHeader } from '@/widgets/Mentor/SectionHeader';

import { AboutAchievements } from '../AboutAchievements/AboutAchievements';
import { AboutProfile } from '../AboutProfile/AboutProfile';
import styles from './AboutSection.module.css';

export const AboutSection = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<section>
			<SectionHeader
				label={t(Mentor.ABOUT_INDICATOR)}
				title={t(Mentor.ABOUT_TITLE)}
				description={t(Mentor.ABOUT_DESCRIPTION)}
			/>
			<div className={styles['wrapper']}>
				<AboutProfile />
				<AboutAchievements />
			</div>
		</section>
	);
};
