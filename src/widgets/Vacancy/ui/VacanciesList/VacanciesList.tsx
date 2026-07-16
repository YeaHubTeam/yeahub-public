import { useTranslations } from 'next-intl';

import { VacancyCard } from '@/entities/vacancy';
import { Vacancy } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface VacanciesListProps {
	vacancies: Vacancy[];
	hasFilters: boolean;
}

export const VacanciesList = ({ vacancies, hasFilters }: VacanciesListProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	if (vacancies.length === 0 && !hasFilters) {
		return (
			<Stub
				type="empty"
				title={t(Vacancies.STUB_EMPTY_TITLE)}
				subtitle={t(Vacancies.STUB_EMPTY_SUBTITLE)}
			/>
		);
	}

	if (vacancies.length === 0 && hasFilters) {
		return <Stub type="filter-empty" />;
	}
	return (
		<Flex direction="column" gap="20">
			{vacancies.map((vacancy) => {
				return <VacancyCard vacancy={vacancy} key={vacancy.id} />;
			})}
		</Flex>
	);
};
