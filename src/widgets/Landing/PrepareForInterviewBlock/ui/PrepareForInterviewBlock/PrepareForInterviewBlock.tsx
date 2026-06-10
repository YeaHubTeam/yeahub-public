import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Landing, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { Specialization } from '../../model/types';
import { InterviewSpecializationCard } from '../InterviewSpecializationCard/InterviewSpecializationCard';
import styles from './PrepareForInterviewBlock.module.css';

const mockSpecialization: Specialization[] = [
	{
		id: 1,
		title: 'Frontend',
		slug: 'react-frontend-developer',
		skills: ['React', 'JavaScript', 'TypeScript'],
	},
	{
		id: 2,
		title: 'Python Backend',
		slug: 'python-developer',
		skills: ['Python', 'Django', 'PostgreSQL'],
	},
	{
		id: 3,
		title: 'Java Backend',
		slug: 'java-backend-developer',
		skills: ['Java', 'Spring', 'SQL'],
	},
	{
		id: 4,
		title: 'Node.js Backend',
		slug: 'nodejs-backend-developer',
		skills: ['Node.js', 'Express', 'JavaScript'],
	},
	{
		id: 5,
		title: 'QA Engineer',
		slug: 'qa-engineer',
		skills: ['SQL', 'Postman', 'Testing'],
	},
	{
		id: 6,
		title: 'Golang Backend',
		slug: 'golang-backend-developer',
		skills: ['Golang', 'MongoDB', 'Redis'],
	},
];

export const PrepareForInterviewBlock = () => {
	const t = useTranslations(i18Namespace.landing);
	const specializationListRoute = route(ROUTES.specializations.page);

	return (
		<section className={styles.wrapper}>
			<Flex direction="column" gap="10" className={styles['title-block']}>
				<Text variant="head3" className={styles.title}>
					{t(Landing.PREPARE_INTERVIEW_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.subtitle}>
					{t(Landing.PREPARE_INTERVIEW_SUBTITLE)}
				</Text>
			</Flex>
			<Link href={specializationListRoute} className={styles.link}>
				{t(Landing.SPECIALIZATION_LIST_LINK)}
				<Icon icon="arrowRight" size={24} />
			</Link>
			<ul className={styles['cards-list']}>
				{mockSpecialization.map((specialization) => (
					<li key={specialization.id}>
						<InterviewSpecializationCard specialization={specialization} />
					</li>
				))}
			</ul>
		</section>
	);
};
