'use client';

import { useHhFilters } from '@/features/hhAnalyticsFilters/hooks/useHhFilters';
import { TablePagination } from '@/shared/ui/TablePagination';

import { HhAnalyticsRow, HhAnalyticsTable } from '../HhAnalyticsTable/HhAnalyticsTable';

interface HhAnalyticsTableWrapperProps {
	initialRows: HhAnalyticsRow[];
	initialMode: 'skills' | 'keywords';
	initialTotal: number;
	initialPage: number;
	pageLimit: number;
}

export const HhAnalyticsTableWrapper = ({
	initialRows,
	initialMode,
	initialTotal,
	initialPage,
	pageLimit,
}: HhAnalyticsTableWrapperProps) => {
	const { filters, setPage } = useHhFilters({
		defaultMode: initialMode,
		defaultPage: initialPage,
	});

	return (
		<>
			<HhAnalyticsTable rows={initialRows} mode={filters.mode} />
			<TablePagination
				total={initialTotal}
				page={filters.page}
				onChangePage={setPage}
				limit={pageLimit}
			/>
		</>
	);
};
