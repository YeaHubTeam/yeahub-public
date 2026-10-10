'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Card } from '@/shared/ui/Card';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { TablePagination } from '@/shared/ui/TablePagination';
import { Text } from '@/shared/ui/Text';

import styles from './ListPageWrapper.module.css';

interface ListPageWrapperProps {
	title: string;
	filters: React.ReactNode;
	children: React.ReactNode;

	page: number;
	total: number;
	limit: number;
	banner?: React.ReactNode;
}

export const ListPageWrapper = ({
	title,
	filters,
	children,
	page,
	total,
	limit,
	banner,
}: ListPageWrapperProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const navigateToPage = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());

		params.set('page', page.toString());

		router.replace(`${pathname}?${params.toString()}`, {
			scroll: false,
		});
	};

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<Flex align="center" justify="between" className={styles.header}>
					<Text variant="body6" isMainTitle maxRows={1}>
						{title}
					</Text>
					<FiltersDrawer>{filters}</FiltersDrawer>
				</Flex>
				<hr className={styles.divider} />
				{children}
				<TablePagination page={page} total={total} limit={limit} onChangePage={navigateToPage} />
			</Card>
			<Flex direction="column" gap="20" className={styles.filters}>
				<Card>{filters}</Card>

				{banner}
			</Flex>
		</Flex>
	);
};
