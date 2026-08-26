import { useTranslations } from 'next-intl';

import { Landing, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { SpecializationCard } from '@/widgets/Landing/PrepareForInterview';

import { Specialization } from '../../model/types';
import styles from './PrepareForInterviewSection.module.css';

const specializations: Specialization[] = [
	{
		id: 1,
		title: 'Frontend',
		slug: 'react-frontend-developer',
		skills: ['React', 'JavaScript', 'TypeScript'],
	},
	{
		id: 2,
		title: 'Python Backend',
		slug: 'python-backend-developer',
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

export const PrepareForInterviewSection = () => {
	const t = useTranslations(i18Namespace.landing);
	const specializationListRoute = route(ROUTES.specializations.page);

	return (
		<SectionWrapper
			title={t(Landing.PREPARE_INTERVIEW_TITLE)}
			subtitle={t(Landing.PREPARE_INTERVIEW_SUBTITLE)}
			actionTitle={t(Landing.SPECIALIZATION_LIST_LINK)}
			actionRoute={specializationListRoute}
		>
			<ul className={styles['cards-list']}>
				{specializations.map((specialization) => (
					<li key={specialization.id}>
						<SpecializationCard specialization={specialization} />
					</li>
				))}
			</ul>
		</SectionWrapper>
	);
};
