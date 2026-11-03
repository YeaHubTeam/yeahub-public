import { format } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';

export const formatDateDayMonth = (dateStr: string, locale?: string): string => {
	return format(new Date(dateStr), 'd MMMM', {
		locale: locale === 'en' ? enUS : ru,
	});
};
