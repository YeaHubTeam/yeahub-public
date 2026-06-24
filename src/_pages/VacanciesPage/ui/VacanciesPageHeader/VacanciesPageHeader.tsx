import { useTranslations } from 'next-intl';

import { Vacancies, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

export const VacanciesPageHeader = () => {
	const t = useTranslations(i18Namespace.vacancies);

	return <Text variant="head2">{t(Vacancies.MAIN_PAGE_TITLE).toLocaleUpperCase()}</Text>;
};
