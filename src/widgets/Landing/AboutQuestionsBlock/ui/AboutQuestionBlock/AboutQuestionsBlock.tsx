import { Skill } from '@/entities/skill';

import { InterviewMaterials } from '../InterviewMaterials/InterviewMaterials';
import { SkillsListTicker } from '../SkillsListTicker/SkillsListTicker';
import styles from './AboutQuestionsBlock.module.css';

interface AboutQuestionsBlockProps {
	skills: Skill[];
	locale: string;
}

export const AboutQuestionsBlock = ({ skills, locale }: AboutQuestionsBlockProps) => {
	return (
		<section className={styles.container} data-testid="AboutQuestionsBlock_Section">
			<InterviewMaterials skills={skills} />
			<SkillsListTicker skills={skills} locale={locale} />
		</section>
	);
};
