import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';

import { MetricCard } from './MetricCard/MetricCard';
import styles from './MetricCards.module.css';

interface MetricCardsProps {
	tasks: ResumeAnalysis['tasks'];
	keywords: ResumeAnalysis['keywords'];
	skills: ResumeAnalysis['skills'];
	priority: number;
}

export const MetricCards = ({ skills, tasks, keywords, priority }: MetricCardsProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	return (
		<div className={styles.container}>
			<MetricCard
				percent={skills.coveragePercent}
				matched={skills.totalMatched}
				total={skills.totalSkills}
				title={t(Vacancies.RESUME_ANALYZER_METRIC_SKILLS)}
			/>
			<MetricCard
				percent={tasks.coveragePercent}
				matched={tasks.missingTasks.length}
				total={tasks.matchedTasks.length}
				title={t(Vacancies.RESUME_ANALYZER_METRIC_TASKS)}
			/>
			<MetricCard
				percent={keywords.coveragePercent}
				matched={keywords.totalMatched}
				total={keywords.totalVacancyKeywords}
				title={t(Vacancies.RESUME_ANALYZER_METRIC_KEYWORDS)}
			/>
			<MetricCard priority={priority} title={t(Vacancies.RESUME_ANALYZER_METRIC_PRIORITY)} />
		</div>
	);
};
