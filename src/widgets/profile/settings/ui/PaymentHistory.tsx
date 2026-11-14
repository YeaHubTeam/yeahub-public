import { useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import type { PaymentHistoryResult } from '@/entities/payment/index.server';
import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { TablePagination } from '@/shared/ui/TablePagination';
import { Text } from '@/shared/ui/Text';

import styles from './PaymentHistory.module.css';

export type PaymentHistoryOptions = {
	ownerId: string;
	initial: PaymentHistoryResult;
	read: (page: number) => Promise<PaymentHistoryResult>;
};
const initialState = (source: PaymentHistoryOptions | undefined, identity: string | null) => ({
	source,
	identity,
	result: source?.ownerId === identity ? source.initial : null,
	page: source?.initial.status === 'success' ? source.initial.page : 1,
	pending: false,
});

// Kept in SettingsShell, not in the unmounted hash panel.
export const usePaymentHistory = (options?: PaymentHistoryOptions) => {
	const { data, status } = useSession();
	const identity = status === 'authenticated' ? (data?.user?.id ?? null) : null;
	const [state, setState] = useState(() => initialState(options, identity));
	if (state.source !== options || state.identity !== identity)
		setState(initialState(options, identity));
	const scope = useRef<object | null>(null);
	const sequence = useRef(0);
	useEffect(() => {
		const token = {};
		scope.current = token;
		return () => {
			scope.current = null;
		};
	}, [options, identity]);
	const ready = !!options && identity !== null && options.ownerId === identity;
	const load = async (page: number) => {
		if (!ready || !options || !Number.isSafeInteger(page) || page < 1) return;
		const token = scope.current;
		const version = ++sequence.current;
		setState((current) => ({ ...current, page, pending: true }));
		let result: PaymentHistoryResult;
		try {
			result = await options.read(page);
		} catch {
			result = { status: 'error' };
		}
		if (scope.current !== token || sequence.current !== version) return;
		setState((current) =>
			current.source === options && current.identity === identity
				? { ...current, result, pending: false }
				: current,
		);
	};
	return {
		result: ready && state.source === options && state.identity === identity ? state.result : null,
		page: state.page,
		pending: state.pending,
		load: (page: number) => {
			void load(page);
		},
	};
};
export type PaymentHistoryController = ReturnType<typeof usePaymentHistory>;

export const PaymentHistory = ({ controller }: { controller: PaymentHistoryController }) => {
	const t = useTranslations(i18Namespace.subscription);
	const { result, page, pending, load } = controller;
	if (result === null) return null;
	return (
		<div className={styles.wrapper} aria-busy={pending}>
			<Text variant="head3">{t('payHistory')}</Text>
			<Flex direction="column" gap="14">
				{result.status === 'success' ? (
					<>
						{result.items.map((payment, index) => (
							<Card key={`${result.page}-${index}`} className={styles.item}>
								<Flex gap="8" align="center">
									<Icon
										icon="sealCheck"
										size={28}
										color={payment.isConfirmed ? 'yellow-900' : 'green-900'}
										className={styles.icon}
									/>
									<Text variant="body3">{payment.dateLabel}</Text>
								</Flex>
							</Card>
						))}
						<TablePagination page={page} total={result.total} limit={5} onChangePage={load} />
					</>
				) : (
					<div role="alert">
						<Text variant="body3">{t('paymentHistory.unavailable')}</Text>
					</div>
				)}
			</Flex>
		</div>
	);
};
