import { Flex } from '@/shared/ui/Flex';

import { AboutAchievements } from '../AboutAchievements/AboutAchievements';
import { AboutHeader } from '../AboutHeader/AboutHeader';
import { AboutProfile } from '../AboutProfile/AboutProfile';
import styles from './About.module.css';

export const About = () => {
	return (
		<Flex direction="column" gap="30" componentType="section" id={styles['about-section']}>
			<AboutHeader />
			<Flex gap="20" justify="end" className={styles['wrapper']}>
				<AboutProfile />
				<AboutAchievements />
			</Flex>
		</Flex>
	);
};
