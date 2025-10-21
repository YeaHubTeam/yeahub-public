'use client';

import React from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GetQuestionsListResponse } from '@/entities/questions';
import { Flex } from '@/shared/ui/Flex';
import { Pagination } from '@/shared/ui/Pagination';

import styles from './QuestionPagePagination.module.css';

interface QuestionPagePaginationProps {
	questionsResponse: GetQuestionsListResponse;
	currentPage: number;
}

export const QuestionPagePagination = ({
	questionsResponse,
	currentPage,
}: QuestionPagePaginationProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const navigateToPage = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', page.toString());
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const onPrevPageClick = () => {
		if (currentPage > 1) {
			navigateToPage(currentPage - 1);
		}
	};

	const onNextPageClick = () => {
		const totalPages = Math.ceil(questionsResponse?.total / questionsResponse?.limit);
		if (currentPage < totalPages) {
			navigateToPage(currentPage + 1);
		}
	};

	const onPaginationButtonClick = (newPage: number) => {
		navigateToPage(newPage);
	};

	if (!questionsResponse?.data || questionsResponse.data.length === 0) {
		return null;
	}

	const totalPages = Math.ceil(questionsResponse.total / questionsResponse.limit);

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
