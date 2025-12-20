'use client';

import React from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Resource } from '@/entities/resource';
import { Flex } from '@/shared/ui/Flex';
import { Pagination } from '@/shared/ui/Pagination';

import styles from './ResourcesPagePagination.module.css';

interface ResourcesPagePaginationProps {
	resources: Resource[];
	total: number;
	limit: number;
	currentPage: number;
}

export const ResourcesPagePagination = ({
	resources,
	total,
	limit,
	currentPage,
}: ResourcesPagePaginationProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const navigateToPage = (page: number) => {
		const params = new URLSearchParams(searchParams?.toString() ?? '');
		params.set('page', page.toString());
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const onPrevPageClick = () => {
		if (currentPage > 1) {
			navigateToPage(currentPage - 1);
		}
	};

	const onNextPageClick = () => {
		const totalPages = Math.ceil(total / limit);
		if (currentPage < totalPages) {
			navigateToPage(currentPage + 1);
		}
	};

	const onPaginationButtonClick = (newPage: number) => {
		navigateToPage(newPage);
	};

	if (!resources || resources.length === 0) {
		return null;
	}

	const totalPages = Math.ceil(total / limit);

	return (
		<Flex justify="center" className={styles.wrapper}>
			<Pagination
				onPrevPageClick={onPrevPageClick}
				onNextPageClick={onNextPageClick}
				onChangePage={onPaginationButtonClick}
				page={currentPage}
				totalPages={totalPages}
			/>
		</Flex>
	);
};
