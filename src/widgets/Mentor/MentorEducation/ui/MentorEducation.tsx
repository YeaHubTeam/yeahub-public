import styles from './MentorEducation.module.css';
import { MentorEducationHeader } from './MentorEducationHeader/MentorEducationHeader';
import { MentorEducationSteps } from './MentorEducationSteps/MentorEducationSteps';

export const MentorEducation = () => {
	return (
		<section className={styles.section}>
			<MentorEducationHeader />
			<MentorEducationSteps />
		</section>
	);
};
