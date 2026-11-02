import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { PracticeCard } from '../PracticeCard/PracticeCard';
import styles from './PracticeList.module.css';

export const PracticeList = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const steps = [
		{
			id: 'monolith',
			index: '01',
			title: t(MentorFullstack.PRACTICE_STEP_MONOLITH_TITLE),
			description: t(MentorFullstack.PRACTICE_STEP_MONOLITH_DESCRIPTION),
		},
		{
			id: 'queues',
			index: '02',
			title: t(MentorFullstack.PRACTICE_STEP_QUEUES_TITLE),
			description: t(MentorFullstack.PRACTICE_STEP_QUEUES_DESCRIPTION),
		},
		{
			id: 'infra',
			index: '03',
			title: t(MentorFullstack.PRACTICE_STEP_INFRA_TITLE),
			description: t(MentorFullstack.PRACTICE_STEP_INFRA_DESCRIPTION),
		},
	];

	return (
		<div className={styles.list}>
			{steps.map((step) => (
				<PracticeCard
					key={step.id}
					index={step.index}
					title={step.title}
					description={step.description}
				/>
			))}
		</div>
	);
};
