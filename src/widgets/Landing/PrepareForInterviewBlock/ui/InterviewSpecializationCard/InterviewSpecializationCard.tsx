import Link from 'next/link';

import { ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';
import { Text } from '@/shared/ui/Text';

import { Specialization } from '../../model/types';
import { SpecializationSkillChip } from '../SpecializationSkillChip/SpecializationSkillChip';
import styles from './InterviewSpecializationCard.module.css';

interface Props {
	specialization: Specialization;
}

export const InterviewSpecializationCard = ({ specialization }: Props) => {
	const detailRoute = route(ROUTES.specializations.detail.page, specialization.slug);

	return (
		<Link href={detailRoute} className={styles.card}>
			<div className={styles['card-ellipse']}></div>
			<div className={styles.icon}></div>
			<Text variant="head3" className={styles.title}>
				{specialization.title}
			</Text>
			<div className={styles['skill-list']}>
				{specialization.skills.map((skill, index) => (
					<SpecializationSkillChip key={index} label={skill} />
				))}
			</div>
		</Link>
	);
};
