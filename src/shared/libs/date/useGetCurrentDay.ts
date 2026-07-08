import { format, isToday, isYesterday } from 'date-fns';
import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';

export const useGetCurrentDay = (dateStr: string): string => {
	const t = useTranslations(i18Namespace.translation);

	const date = new Date(dateStr);

	if (isToday(date)) return t(Translation.DATE_TODAY);
	if (isYesterday(date)) return t(Translation.DATE_YESTERDAY);

	return format(date, 'dd.MM.yyyy');
};
