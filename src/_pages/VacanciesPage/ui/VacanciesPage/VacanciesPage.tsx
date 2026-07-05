import type { Vacancy } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';
import { VacanciesList } from '@/widgets/Vacancy';

import { VacanciesPageHeader } from '../VacanciesPageHeader/VacanciesPageHeader';
import { VacanciesPagePagination } from '../VacanciesPagePagination/VacanciesPagePagination';
import styles from './VacanciesPage.module.css';

interface VacanciesPageProps {
	vacancies: Vacancy[];
	page: number;
	total: number;
	limit: number;
}

export const VacanciesPage = ({ vacancies, page, total, limit }: VacanciesPageProps) => {
	return (
		<Flex gap="20" align="start">
			<Flex gap="20" direction="column" className={styles.main}>
				<VacanciesPageHeader />
				<VacanciesList vacancies={vacancies} />
				<VacanciesPagePagination total={total} limit={limit} currentPage={page} />
			</Flex>
			<Flex className={styles.filters}></Flex>
		</Flex>
	);
};
