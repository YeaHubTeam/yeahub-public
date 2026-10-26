import { useTranslations } from 'next-intl';

import { MentorWorldwide, ROUTES, i18Namespace } from '@/shared/config';

import { ProgramCard } from '../ProgramCard/ProgramCard';
import styles from './ProgramList.module.css';

export const ProgramList = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<div className={styles.list}>
			<ProgramCard
				variant="frontend"
				badge={t(MentorWorldwide.PROGRAMS_BADGE)}
				title={t(MentorWorldwide.PROGRAMS_FRONTEND_TITLE)}
				description={t(MentorWorldwide.PROGRAMS_FRONTEND_DESCRIPTION)}
				chips={[
					t(MentorWorldwide.PROGRAMS_FRONTEND_CHIP_1),
					t(MentorWorldwide.PROGRAMS_FRONTEND_CHIP_2),
					t(MentorWorldwide.PROGRAMS_FRONTEND_CHIP_3),
					t(MentorWorldwide.PROGRAMS_FRONTEND_CHIP_4),
				]}
				button={t(MentorWorldwide.PROGRAMS_FRONTEND_BUTTON)}
				href={ROUTES.mentor.page}
			/>
			<ProgramCard
				variant="fullstack"
				badge={t(MentorWorldwide.PROGRAMS_BADGE)}
				title={t(MentorWorldwide.PROGRAMS_FULLSTACK_TITLE)}
				description={t(MentorWorldwide.PROGRAMS_FULLSTACK_DESCRIPTION)}
				chips={[
					t(MentorWorldwide.PROGRAMS_FULLSTACK_CHIP_1),
					t(MentorWorldwide.PROGRAMS_FULLSTACK_CHIP_2),
					t(MentorWorldwide.PROGRAMS_FULLSTACK_CHIP_3),
					t(MentorWorldwide.PROGRAMS_FULLSTACK_CHIP_4),
				]}
				button={t(MentorWorldwide.PROGRAMS_FULLSTACK_BUTTON)}
				href={ROUTES['mentor-fullstack'].page}
			/>
		</div>
	);
};
