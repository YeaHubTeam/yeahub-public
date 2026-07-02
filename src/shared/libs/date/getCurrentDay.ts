import { format, isToday, isYesterday } from 'date-fns';

interface GetCurrentDayLabels {
	today: string;
	yesterday: string;
}

export const getCurrentDay = (dateStr: string, labels: GetCurrentDayLabels): string => {
	const date = new Date(dateStr);

	if (isToday(date)) return labels.today;
	if (isYesterday(date)) return labels.yesterday;

	return format(date, 'dd.MM.yyyy');
};
