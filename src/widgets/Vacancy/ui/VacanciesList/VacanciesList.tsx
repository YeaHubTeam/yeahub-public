import { useTranslations } from 'next-intl';

import { VacancyCard } from '@/entities/vacancy';
import { VacancyListItem } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface VacanciesListProps {
	vacancies: VacancyListItem[];
	hasFilters: boolean;
	locale: string;
	specialization: string;
}

export const VacanciesList = ({
	vacancies,
	hasFilters,
	specialization,
	locale,
}: VacanciesListProps) => {
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
				return (
					<VacancyCard
						vacancy={vacancy}
						key={vacancy.id}
						locale={locale}
						specialization={specialization}
					/>
				);
			})}
		</Flex>
	);
};
