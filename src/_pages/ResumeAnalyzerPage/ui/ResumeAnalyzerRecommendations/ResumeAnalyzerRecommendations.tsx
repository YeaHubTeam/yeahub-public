import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import RecommendationsImage from '@/shared/assets/images/recommendations.png';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAnalyzerRecommendations.module.css';

interface ResumeAnalyzerRecommendationsProps {
	recommendations: string[];
}

export const ResumeAnalyzerRecommendations = async ({
	recommendations,
}: ResumeAnalyzerRecommendationsProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<Card withBorder className={styles.card} contentClassName={styles.layout}>
			<div>
				<Flex align="center" gap="8" className={styles.header}>
					<Icon icon="starFall" size={24} color="purple-700" aria-hidden />
					<h2 className={styles.title}>{t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_TITLE)}</h2>
				</Flex>

				<Text variant={'body3-accent'} color={'black-500'} className={styles.description}>
					{t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_DESCRIPTION)}
				</Text>

				<Flex componentType="ul" direction="column" gap="8" className={styles.list}>
					{recommendations.map((recommendation, index) => (
						<li key={index} className={styles.recommendation}>
							<Text variant={'body3-accent'}>{recommendation}</Text>
						</li>
					))}
				</Flex>
			</div>
			<Image
				className={styles.image}
				src={RecommendationsImage}
				alt={t(Vacancies.RESUME_ANALYZER_RECOMMENDATIONS_IMAGE_ALT)}
			/>
		</Card>
	);
};
