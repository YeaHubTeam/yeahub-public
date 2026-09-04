import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import RecommendationsIcon from '@/shared/assets/icons/recommendations.svg';
import RecommendationsImage from '@/shared/assets/images/recommendations.png';
import { Vacancies, i18Namespace } from '@/shared/config';

import styles from './ResumeAnalyzerRecommendations.module.css';

interface ResumeAnalyzerRecommendationsProps {
	recommendations: string[];
}

export const ResumeAnalyzerRecommendations = async ({
	recommendations,
}: ResumeAnalyzerRecommendationsProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<section className={styles.recommendations}>
			<div className={styles.content}>
				<div className={styles.header}>
					<RecommendationsIcon className={styles.icon} width={24} height={24} aria-hidden />
					<h2 className={styles.title}>{t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_TITLE)}</h2>
				</div>

				<p className={styles.description}>
					{t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_DESCRIPTION)}
				</p>

				<ul className={styles.list}>
					{recommendations.map((item, index) => (
						<li key={index} className={styles.item}>
							{item}
						</li>
					))}
				</ul>
			</div>
			<Image
				className={styles.image}
				src={RecommendationsImage}
				alt={t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_IMAGE_ALT)}
			/>
		</section>
	);
};
