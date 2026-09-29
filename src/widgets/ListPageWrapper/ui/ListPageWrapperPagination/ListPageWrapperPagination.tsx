'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { TablePagination } from '@/shared/ui/TablePagination';

export interface ListPageWrapperPaginationProps {
	total: number;
	limit: number;
	currentPage: number;
}

export const ListPageWrapperPagination = ({
	total,
	limit,
	currentPage,
}: ListPageWrapperPaginationProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const navigateToPage = (page: number) => {
		const params = new URLSearchParams(searchParams?.toString() ?? '');
		params.set('page', page.toString());
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<TablePagination page={currentPage} onChangePage={navigateToPage} limit={limit} total={total} />
	);
};
