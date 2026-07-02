import { useTranslations } from 'next-intl';

import { VacancyDetails } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { getCurrentDay } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import styles from './VacancySource.module.css';

interface VacancySourceProps {
	source: VacancyDetails['source'];
	publishDate: VacancyDetails['publishedAt'];
}

export const VacancySource = ({ source, publishDate }: VacancySourceProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const formattedDate = getCurrentDay(publishDate, {
		today: t(Vacancies.SOURCE_DATE_TODAY),
		yesterday: t(Vacancies.SOURCE_DATE_TODAY),
	});

	return (
		<Flex className={styles.container}>
			<Flex gap="8" direction="column" className={styles.source}>
				<Text variant="body3-accent" color="black-400">
					{t(Vacancies.SOURCE_TITLE)}
				</Text>
				<Flex gap="8" align="center">
					{/* пока не приходят картинки, либо же можно закинуть их в шаред */}
					<ImageWithWrapper src={null} alt={source ?? ''} className={styles['source-logo']} />
					<Text variant="body2-accent" color="black-900">
						{source}
					</Text>
				</Flex>
			</Flex>
			<Flex gap="8" direction="column" className={styles.date}>
				<Text variant="body3-accent" color="black-400">
					{t(Vacancies.SOURCE_DATE_ADDED)}
				</Text>
				<Text variant="body2-accent" color="black-900">
					{formattedDate}
				</Text>
			</Flex>
		</Flex>
	);
};
