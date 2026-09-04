import Image from 'next/image';

import RecommendationsIcon from '@/shared/assets/icons/recommendations.svg';
import RecommendationsImage from '@/shared/assets/images/recommendations.png';

import styles from './ResumeAnalyzerRecommendations.module.css';

interface ResumeAnalyzerRecommendationsProps {
	recommendations: string[];
}

export const ResumeAnalyzerRecommendations = ({
	recommendations,
}: ResumeAnalyzerRecommendationsProps) => {
	return (
		<section className={styles.recommendations}>
			<div className={styles.content}>
				<div className={styles.header}>
					<RecommendationsIcon className={styles.icon} width={24} height={24} />
					<h2 className={styles.title}>Общие рекомендации AI</h2>
				</div>

				<p className={styles.description}>
					На основе анализа резюме и сравнения с требованиями рынка мы подготовили рекомендации,
					которые помогут повысить соответствие вакансиям.
				</p>

				<ul className={styles.list}>
					{recommendations.map((item, index) => (
						<li key={index} className={styles.item}>
							{item}
						</li>
					))}
				</ul>
			</div>
			<Image className={styles.image} src={RecommendationsImage} alt="Иконка рекомендации" />
		</section>
	);
};
