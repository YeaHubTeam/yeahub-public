import { getTranslations } from 'next-intl/server';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAnalyzerBadge.module.css';

export const ResumeAnalyzerBadge = async () => {
	const t = await getTranslations(i18Namespace.vacancies);

	const items = [
		Vacancies.RESUME_ANALYZER_SPECIALIZATION,
		Vacancies.RESUME_ANALYZER_INDUSTRY,
		Vacancies.RESUME_ANALYZER_VACANCIES_COUNT,
	];

	return (
		<Flex gap="6" className={styles.badge} align="center" justify="center">
			{items.map((el) => (
				<Flex key={el} className={styles.item} gap="6" wrap="wrap">
					<Text variant="body2" color="black-900">
						{t(el)}
					</Text>
				</Flex>
			))}
		</Flex>
	);
};
