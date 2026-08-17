import { format } from 'date-fns';
import { getTranslations } from 'next-intl/server';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './VacanciesMarketHeader.module.css';

const UPDATED_AT_DATE_FORMAT = 'dd.MM.yyyy';

interface VacanciesMarketHeaderProps {
	updatedAt: string;
}

export const VacanciesMarketHeader = async ({ updatedAt }: VacanciesMarketHeaderProps) => {
	const t = await getTranslations(i18Namespace.vacancies);

	return (
		<Flex direction="column" gap="12" className={styles.header}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{t(Vacancies.MARKET_PAGE_TITLE)}
			</Text>

			<Text variant="body3-accent" className={styles.description}>
				{t(Vacancies.MARKET_PAGE_DESCRIPTION)}
			</Text>

			<Flex align="center" gap="6">
				<Icon icon="calendarNoDots" size={20} color="purple-700" aria-hidden />

				<Text variant="body1" color="black-500">
					{t(Vacancies.MARKET_PAGE_UPDATED_AT, {
						date: format(updatedAt, UPDATED_AT_DATE_FORMAT),
					})}
				</Text>
			</Flex>
		</Flex>
	);
};
