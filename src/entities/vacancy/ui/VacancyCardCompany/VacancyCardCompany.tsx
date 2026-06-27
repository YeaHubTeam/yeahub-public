import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { getCurrentDay } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { VacancyCompany } from '../../model/types/vacancy';
import styles from './VacancyCardCompany.module.css';

interface VacancyCardCompanyProps {
	company: VacancyCompany;
	publishedAt: string;
	title: string;
}

export const VacancyCardCompany = ({ company, publishedAt, title }: VacancyCardCompanyProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	const { imageSrc, title: companyTitle } = company;
	const publishedDate = getCurrentDay(publishedAt, {
		today: t(Vacancies.MAIN_PAGE_DAY_TODAY),
		yesterday: t(Vacancies.MAIN_PAGE_DAY_YESTERDAY),
	});

	return (
		<Flex gap="12" wrap="wrap" justify="between">
			<Flex gap="9" align="end">
				<ImageWithWrapper
					src={imageSrc ?? undefined}
					alt={companyTitle}
					className={styles['image-wrapper']}
				/>
				<Text variant="body3" color="black-400">
					{companyTitle}
				</Text>
			</Flex>
			<StatusChip status={{ text: publishedDate, variant: 'green' }} />
			<Text variant="body6" className={styles.title}>
				{title}
			</Text>
		</Flex>
	);
};
