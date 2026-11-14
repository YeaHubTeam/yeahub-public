import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import type { PaymentHistoryResult } from '@/entities/payment/index.server';

import subscription from '../../../../../public/locales/ru/subscription.json';
import { PaymentHistory, usePaymentHistory } from './PaymentHistory';
import type { PaymentHistoryOptions } from './PaymentHistory';

let identity: string | null = 'owner-a';
jest.mock('next-auth/react', () => ({
	useSession: () => ({
		data: identity ? { user: { id: identity } } : null,
		status: identity ? 'authenticated' : 'unauthenticated',
	}),
}));
const page = (number = 1, date = '1 февраля 2026', total = 11): PaymentHistoryResult => ({
	status: 'success',
	items: [{ dateLabel: date, isConfirmed: number === 1 }],
	page: number,
	limit: 5,
	total,
});
const Harness = ({ options }: { options: PaymentHistoryOptions }) => {
	const controller = usePaymentHistory(options);
	return <PaymentHistory controller={controller} />;
};
const tree = (options: PaymentHistoryOptions) => (
	<NextIntlClientProvider locale="ru" messages={{ subscription }}>
		<Harness options={options} />
	</NextIntlClientProvider>
);
const setup = (initial: PaymentHistoryResult = page()) => {
	const read = jest
		.fn<Promise<PaymentHistoryResult>, [number]>()
		.mockResolvedValue(page(2, '2 февраля 2026'));
	const options = { ownerId: 'owner-a', initial, read };
	const view = render(tree(options));
	return { ...view, read, options };
};
const deferred = () => {
	let resolve!: (value: PaymentHistoryResult) => void;
	const promise = new Promise<PaymentHistoryResult>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};
const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;
beforeEach(() => {
	identity = 'owner-a';
	fetchMock = jest.fn();
	globalThis.fetch = fetchMock;
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
});
it('renders only the heading, date, React icon and pagination without loading on mount', () => {
	const view = setup();
	expect(screen.getByText('Ваши предыдущие платежи')).toBeInTheDocument();
	expect(screen.getByText('1 февраля 2026').parentElement?.querySelector('svg')).toHaveStyle({
		color: 'var(--color-yellow-900)',
	});
	expect(screen.queryByRole('link')).not.toBeInTheDocument();
	expect(
		screen.queryByText(/₽|CONFIRMED|orderId|чек|Подписаться|Отменить подписку/),
	).not.toBeInTheDocument();
	expect(view.read).not.toHaveBeenCalled();
});
it('loads selected pages with only their number and uses green for non-confirmed rows', async () => {
	const view = setup();
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await waitFor(() => expect(screen.getByText('2 февраля 2026')).toBeInTheDocument());
	expect(view.read).toHaveBeenCalledTimes(1);
	expect(view.read).toHaveBeenCalledWith(2);
	expect(screen.getByText('2 февраля 2026').parentElement?.querySelector('svg')).toHaveStyle({
		color: 'var(--color-green-900)',
	});
});
it.each([0, 1, 5])(
	'hides pagination for total %s and preserves the empty success layout',
	(total) => {
		const view = setup({ status: 'success', items: [], page: 1, limit: 5, total });
		expect(screen.getByText('Ваши предыдущие платежи')).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(view.read).not.toHaveBeenCalled();
	},
);
it.each(['error', 'forbidden', 'unauthenticated', 'refresh-required', 'invalid-input'] as const)(
	'isolates initial %s without retry or logout',
	(status) => {
		const view = setup({ status });
		expect(screen.getByRole('alert')).toHaveTextContent('История платежей временно недоступна');
		expect(view.read).not.toHaveBeenCalled();
	},
);
it('does not allow an older page response to overwrite a more recent selection', async () => {
	const view = setup();
	const second = deferred();
	const third = deferred();
	view.read.mockReturnValueOnce(second.promise).mockReturnValueOnce(third.promise);
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	fireEvent.click(screen.getByRole('button', { name: '3' }));
	await act(async () => {
		third.resolve(page(3, '3 февраля 2026'));
		await third.promise;
	});
	await act(async () => {
		second.resolve(page(2, '2 февраля 2026'));
		await second.promise;
	});
	expect(screen.getByText('3 февраля 2026')).toBeInTheDocument();
	expect(screen.queryByText('2 февраля 2026')).not.toBeInTheDocument();
	expect(view.read.mock.calls).toEqual([[2], [3]]);
});
it('shows a local pagination error without automatic retries or a false empty success', async () => {
	const view = setup();
	view.read.mockRejectedValue(new Error('Private backend error'));
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(screen.queryByText('Private backend error')).not.toBeInTheDocument();
	expect(view.read).toHaveBeenCalledTimes(1);
});
it('hides rows on logout, rejects old identity results, and requires matching server ownership', async () => {
	const view = setup();
	const pending = deferred();
	view.read.mockReturnValueOnce(pending.promise);
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	identity = null;
	view.rerender(tree(view.options));
	expect(screen.queryByText('Ваши предыдущие платежи')).not.toBeInTheDocument();
	identity = 'owner-b';
	view.rerender(tree(view.options));
	expect(screen.queryByText('1 февраля 2026')).not.toBeInTheDocument();
	const optionsB = {
		ownerId: 'owner-b',
		initial: page(1, 'Новая история'),
		read: jest.fn().mockResolvedValue(page(2, 'Новая страница')),
	};
	view.rerender(tree(optionsB));
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await waitFor(() => expect(screen.getByText('Новая страница')).toBeInTheDocument());
	await act(async () => {
		pending.resolve(page(2, 'Старая история'));
		await pending.promise;
	});
	expect(screen.getByText('Новая страница')).toBeInTheDocument();
	expect(screen.queryByText('Старая история')).not.toBeInTheDocument();
});
it('ignores responses after the controller unmounts', async () => {
	const view = setup();
	const pending = deferred();
	view.read.mockReturnValueOnce(pending.promise);
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	view.unmount();
	await act(async () => {
		pending.resolve(page(2));
		await pending.promise;
	});
	expect(view.read).toHaveBeenCalledTimes(1);
});
