import { VacancyCard } from '@/entities/vacancy';
import { VacancyListItem } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';

interface VacanciesListProps {
	vacancies: VacancyListItem[];
	locale: string;
	specialization: string;
}

export const VacanciesList = ({ vacancies, specialization, locale }: VacanciesListProps) => {
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
