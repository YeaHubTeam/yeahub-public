import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type { PaymentHistoryResult } from '../model/types/paymentHistory';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const nonNegativeInteger = (value: unknown): value is number =>
	typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const dateLabel = (value: unknown): string | null => {
	if (
		typeof value !== 'string' ||
		!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
	)
		return null;
	const date = parseISO(value);
	const calendar = new Date(`${value.slice(0, 19)}Z`);
	if (
		!Number.isFinite(date.getTime()) ||
		!Number.isFinite(calendar.getTime()) ||
		calendar.toISOString().slice(0, 19) !== value.slice(0, 19)
	)
		return null;
	return format(date, 'd MMMM yyyy', { locale: ru });
};

export const readPaymentHistory = async (
	page: unknown,
	credentials: { userId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<PaymentHistoryResult> => {
	if (!nonNegativeInteger(page) || page < 1 || !Number.isSafeInteger((page - 1) * 5))
		return { status: 'invalid-input' };
	if (
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(credentials.userId) ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
	)
		return { status: 'unauthenticated' };
	const query = new URLSearchParams({ page: String(page), limit: '5' });
	const result = await backendHttp<PaymentHistoryResult>({
		config,
		path: `/payments/${credentials.userId}?${query.toString()}`,
		method: 'GET',
		effect: 'read',
		cache: 'no-store',
		timeoutMs: 5000,
		headers: { Authorization: `Bearer ${credentials.accessToken}` },
		decode: async (response) => {
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) return { status: 'forbidden' };
			if (response.status !== 200) return { status: 'error' };
			const data: unknown = await response.json();
			if (
				!object(data) ||
				!Array.isArray(data.data) ||
				data.page !== page ||
				data.limit !== 5 ||
				!nonNegativeInteger(data.total) ||
				data.data.length !== Math.min(5, Math.max(0, data.total - (page - 1) * 5))
			)
				return { status: 'error' };
			const items: Extract<PaymentHistoryResult, { status: 'success' }>['items'] = [];
			for (const item of data.data) {
				if (!object(item) || (item.status !== null && typeof item.status !== 'string'))
					return { status: 'error' };
				const label = dateLabel(item.createdAt);
				if (label === null) return { status: 'error' };
				items.push({ dateLabel: label, isConfirmed: item.status === 'CONFIRMED' });
			}
			return { status: 'success', items, page, limit: 5, total: data.total };
		},
	});
	return result.status === 'response' ? result.value : { status: 'error' };
};
