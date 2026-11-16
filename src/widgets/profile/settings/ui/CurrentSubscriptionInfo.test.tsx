import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import subscription from '../../../../../public/locales/ru/subscription.json';
import { CurrentSubscriptionInfo } from './CurrentSubscriptionInfo';

const mount = (state: 'active' | 'canceled' = 'active', daysLeft = 2, total = 31) =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ subscription }}>
			<CurrentSubscriptionInfo
				subscription={{
					state,
					daysLeft,
					daysInCreationMonth: total,
					endDateLabel: '1 февраля 2026',
				}}
			/>
		</NextIntlClientProvider>,
	);
it('renders React texts and the large progress bar, leaving cancellation disabled', () => {
	const originalFetch = globalThis.fetch;
	const fetch = jest.fn();
	globalThis.fetch = fetch;
	try {
		mount();
		expect(screen.getByText('Участник сообщества')).toBeInTheDocument();
		expect(
			screen.getByText('Отличный выбор, теперь вам доступны все функции сервиса'),
		).toBeInTheDocument();
		expect(
			screen.getByText('Платеж будет продлен автоматически 1 февраля 2026'),
		).toBeInTheDocument();
		const progress = screen.getByRole('progressbar');
		expect(progress).toHaveAttribute('value', '2');
		expect(progress).toHaveAttribute('max', '31');
		expect(progress).toHaveClass('progress-bar-large');
		const cancel = screen.getByRole('button', { name: 'Отменить подписку' });
		expect(cancel).toBeDisabled();
		fireEvent.click(cancel);
		expect(fetch).not.toHaveBeenCalled();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	} finally {
		globalThis.fetch = originalFetch;
	}
});
it('shows access end and no cancellation action for canceled subscriptions', () => {
	mount('canceled');
	expect(
		screen.getByText('Вы отменили подписку. Полный доступ сохранится до 1 февраля 2026.'),
	).toBeInTheDocument();
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it.each([
	[0, 'дней'],
	[1, 'день'],
	[2, 'дня'],
	[5, 'дней'],
	[11, 'дней'],
	[21, 'день'],
	[22, 'дня'],
	[90, 'дней'],
] as const)('uses Russian plural for %s', (days, word) => {
	mount('active', days);
	expect(screen.getByText(`Осталось ${days} ${word}`)).toBeInTheDocument();
});
it('preserves a raw remaining count greater than the creation month maximum', () => {
	mount('active', 365, 28);
	expect(screen.getByRole('progressbar')).toHaveAttribute('value', '365');
	expect(screen.getByRole('progressbar')).toHaveAttribute('max', '28');
	expect(screen.getByText('Осталось 365 дней')).toBeInTheDocument();
});

it.each([false, true])(
	'opens cancellation through the supplied handler only when unlocked: %s',
	(disabled) => {
		const onCancel = jest.fn();
		render(
			<NextIntlClientProvider locale="ru" messages={{ subscription }}>
				<CurrentSubscriptionInfo
					subscription={{
						state: 'active',
						daysLeft: 2,
						daysInCreationMonth: 31,
						endDateLabel: '1 февраля 2026',
					}}
					onCancel={onCancel}
					cancelDisabled={disabled}
				/>
			</NextIntlClientProvider>,
		);
		const button = screen.getByRole('button', { name: 'Отменить подписку' });
		expect(button).toHaveClass('button-destructive-outline');
		fireEvent.click(button);
		expect(onCancel).toHaveBeenCalledTimes(disabled ? 0 : 1);
		expect(screen.getByText('Осталось 2 дня')).toBeInTheDocument();
		expect(screen.getByRole('progressbar')).toHaveAttribute('max', '31');
	},
);
it('does not expose cancellation for canceled even with a handler', () => {
	const onCancel = jest.fn();
	render(
		<NextIntlClientProvider locale="ru" messages={{ subscription }}>
			<CurrentSubscriptionInfo
				subscription={{
					state: 'canceled',
					daysLeft: 2,
					daysInCreationMonth: 31,
					endDateLabel: '1 февраля 2026',
				}}
				onCancel={onCancel}
			/>
		</NextIntlClientProvider>,
	);
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
	expect(onCancel).not.toHaveBeenCalled();
});
