import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import subscription from '../../../../../public/locales/ru/subscription.json';
import translation from '../../../../../public/locales/ru/translation.json';
import { TariffTab } from './TariffTab';
import type { TariffTabProps } from './TariffTab';

jest.mock('@/shared/assets/images/accessDenied.png', () => ({
	src: '/synthetic-access.png',
	width: 186,
	height: 186,
}));
jest.mock('@/shared/assets/images/loadError.png', () => ({
	src: '/synthetic-error.png',
	width: 186,
	height: 186,
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({}), usePathname: () => '/ru/settings' }));
const tariffs = [
	{ id: 4, code: 'year', finalPrice: 6000, pricePerMonth: 1000, discount: 50, monthPeriod: 12 },
	{ id: 2, code: 'month', finalPrice: 999, pricePerMonth: 999, discount: 0, monthPeriod: 1 },
	{ id: 1, code: 'free', finalPrice: 0, pricePerMonth: 0, discount: 0, monthPeriod: 1 },
	{ id: 3, code: 'quarter', finalPrice: 2400, pricePerMonth: 1000, discount: 20, monthPeriod: 3 },
] satisfies Extract<TariffTabProps['catalog'], { status: 'success' }>['tariffs'];
const defaults: TariffTabProps = {
	catalog: { status: 'success', gate: { status: 'allowed', showTariffs: true }, tariffs },
	canStartTrial: true,
	currentSubscription: null,
};
const mount = (props: Partial<TariffTabProps> = {}) =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ subscription, translation }}>
			<TariffTab {...defaults} {...props} />
		</NextIntlClientProvider>,
	);
const originalFetch = globalThis.fetch;
let fetchSpy: jest.Mock;
beforeEach(() => {
	fetchSpy = jest.fn().mockRejectedValue(new Error('No backend calls allowed'));
	globalThis.fetch = fetchSpy;
});
afterEach(() => {
	expect(fetchSpy).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
	jest.restoreAllMocks();
});
it('renders real prices, React card order, badges and disabled actions without mutations', () => {
	mount();
	expect(screen.getByText('Членство')).toBeInTheDocument();
	expect(
		screen.getByText(subscription.description, { normalizer: (value) => value }),
	).toBeInTheDocument();
	expect(screen.getAllByRole('article').map((item) => item.getAttribute('aria-label'))).toEqual([
		'Бесплатный',
		'1 месяц',
		'3 месяца',
		'1 год',
	]);
	const quarter = within(screen.getByRole('article', { name: '3 месяца' }));
	expect(quarter.getByText('2400₽')).toBeInTheDocument();
	expect(quarter.getByText('3000₽')).toHaveClass('crossed');
	expect(quarter.getByText('800₽/месяц')).toBeInTheDocument();
	expect(quarter.getByText('Экономия 20%')).toBeInTheDocument();
	expect(screen.getByText('Базовый тариф')).toBeInTheDocument();
	expect(screen.getByText('6000₽')).toBeInTheDocument();
	expect(screen.getByText('12000₽')).toBeInTheDocument();
	for (const button of screen.getAllByRole('button')) {
		expect(button).toBeDisabled();
		fireEvent.click(button);
	}
});
it('preserves free and premium benefits without changing public tariff translations', () => {
	mount();
	const free = within(screen.getByRole('article', { name: 'Бесплатный' }));
	expect(free.getByText('Бесплатные подборки')).toBeInTheDocument();
	expect(free.getByText('Продвинутый тренажер')).toHaveClass('crossed');
	expect(free.getByText('Статистика обучения')).toHaveClass('crossed');
	expect(
		within(screen.getByRole('article', { name: '1 месяц' })).getByText('Все\u00a0подборки', {
			normalizer: (value) => value,
		}),
	).toBeInTheDocument();
	expect(subscription.card.benefits.second).toBe('Список всех задач');
});
it('hides trial-only subtitle and action when trial is not available', () => {
	mount({ canStartTrial: false });
	expect(screen.queryByText('Попробуйте 7 дней ПРО')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Тест драйв 7 дней' })).not.toBeInTheDocument();
});
it('renders only supplied tariffs and respects backend periods', () => {
	mount({
		catalog: {
			status: 'success',
			gate: { status: 'allowed', showTariffs: true },
			tariffs: [{ ...tariffs[0], monthPeriod: 24 }],
		},
	});
	expect(screen.getAllByRole('article')).toHaveLength(1);
	expect(screen.getByRole('article', { name: '2 года' })).toBeInTheDocument();
});
it.each(['missing', 'disabled', 'role-denied', 'unavailable'] as const)(
	'keeps React fallback, banner and FAQ for %s',
	(status) => {
		mount({ catalog: { status: 'hidden', gate: { status, showTariffs: false } } });
		expect(screen.queryByRole('article')).not.toBeInTheDocument();
		expect(screen.getByText('Информация о тарифах временно недоступна')).toBeInTheDocument();
		expect(screen.getByText(subscription.stub.hide.tariffs.description)).toBeInTheDocument();
		expect(screen.getByText(subscription.banner.title)).toBeInTheDocument();
		expect(screen.getByText(subscription.faq.title)).toBeInTheDocument();
		expect(screen.getByText(/Стоимость членства составляет 800 рублей/)).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	},
);
it('shows a safe error without retries or fabricated prices', () => {
	mount({ catalog: { status: 'error', reason: 'backend' } });
	expect(screen.getByRole('alert')).toHaveTextContent('Информация о тарифах временно недоступна');
	expect(screen.queryByRole('article')).not.toBeInTheDocument();
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('preserves banner item order, separate FAQ and fixed React price regardless of backend price', () => {
	mount();
	const bannerTitle = screen.getByText(subscription.banner.title);
	expect(
		screen.getByText('2400₽').compareDocumentPosition(bannerTitle) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	const list = screen.getByRole('list');
	expect(
		within(list)
			.getAllByRole('listitem')
			.map((item) => item.textContent),
	).toEqual(
		['first', 'fourth', 'second', 'fifth', 'third'].map(
			(key) => subscription.banner.list[key as keyof typeof subscription.banner.list],
		),
	);
	expect(
		screen
			.getByText(subscription.banner.list.thanks)
			.compareDocumentPosition(screen.getByText(subscription.faq.title)) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	expect(screen.getByText(/Стоимость членства составляет 800 рублей/)).toHaveTextContent(
		subscription.faq.first.answer.replace('{price}', '800'),
	);
	for (const key of ['first', 'second', 'third', 'fourth'] as const)
		expect(
			screen.getByText(subscription.faq[key].question, { normalizer: (value) => value }),
		).toBeInTheDocument();
	const summary = screen.getByText(subscription.faq.first.question).closest('summary');
	expect(summary).toBeInTheDocument();
});
it('does not fabricate missing cards for an empty valid catalog', () => {
	mount({
		catalog: { status: 'success', gate: { status: 'allowed', showTariffs: true }, tariffs: [] },
	});
	expect(screen.queryByRole('article')).not.toBeInTheDocument();
	expect(screen.getByText(subscription.banner.title)).toBeInTheDocument();
});
it('replaces the placeholder with the current subscription instead of free tariffs', () => {
	mount({
		currentSubscription: {
			state: 'active',
			daysLeft: 2,
			daysInCreationMonth: 31,
			endDateLabel: '1 февраля 2026',
		},
	});
	expect(screen.getByText('Участник сообщества')).toBeInTheDocument();
	expect(screen.queryByText('Членство')).not.toBeInTheDocument();
	expect(screen.queryByRole('article')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
});

it('connects only the eligible free-card trial button to its controller', () => {
	const activate = jest.fn();
	mount({ trialController: { activate, disabled: false, pending: false, toast: null } });
	const button = screen.getByRole('button', { name: 'Тест драйв 7 дней' });
	expect(button).not.toBeDisabled();
	fireEvent.click(button);
	expect(activate).toHaveBeenCalledTimes(1);
	for (const paid of screen.getAllByRole('button', { name: 'Подписаться' }))
		expect(paid).toBeDisabled();
});

it('opens the matching paid tariff without initializing a payment from the card', () => {
	const open = jest.fn();
	const controller = { open, canOpen: () => true } as unknown as NonNullable<
		TariffTabProps['paymentController']
	>;
	mount({ paymentController: controller });
	const buttons = screen.getAllByRole('button', { name: 'Подписаться' });
	buttons.forEach((button) => fireEvent.click(button));
	expect(open.mock.calls).toEqual([[2], [3], [4]]);
	expect(fetchSpy).not.toHaveBeenCalled();
});

it('opens cancellation of the displayed active subscription through its controller only', () => {
	const open = jest.fn();
	mount({
		currentSubscription: {
			state: 'active',
			daysLeft: 2,
			daysInCreationMonth: 31,
			endDateLabel: '1 февраля 2026',
		},
		cancellationController: { open, canOpen: true } as unknown as NonNullable<
			TariffTabProps['cancellationController']
		>,
	});
	fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));
	expect(open).toHaveBeenCalledTimes(1);
	expect(fetchSpy).not.toHaveBeenCalled();
});

it('retains the React banner columns, purple dots, spacing and thanks inside its list', () => {
	mount();
	const list = screen.getByRole('list');
	expect(list).toHaveClass('banner-list');
	expect(
		within(list)
			.getAllByRole('listitem')
			.map((item) => item.textContent),
	).toEqual(
		['first', 'fourth', 'second', 'fifth', 'third'].map(
			(key) => subscription.banner.list[key as keyof typeof subscription.banner.list],
		),
	);
	expect(within(list).getByText(subscription.banner.list.thanks)).toHaveClass('banner-thanks');
	expect(list.lastElementChild).toHaveTextContent(subscription.banner.list.thanks);
	const card = screen.getByText(subscription.banner.title).closest('[data-testid="Card"]');
	expect(card).toHaveClass('medium', 'border', 'card-outside-shadow');
	const css = readFileSync(join(__dirname, 'TariffTab.module.css'), 'utf8');
	expect(css).toMatch(/\.banner-list\s*\{[^}]*flex-wrap: wrap;[^}]*gap: 8px/);
	expect(css).toMatch(
		/\.banner-list li\s*\{[^}]*flex: 1 1 45%;[^}]*padding: 2px 0;[^}]*padding-left: 16px/,
	);
	expect(css).toMatch(
		/\.banner-list li::before\s*\{[^}]*width: 8px;[^}]*height: 8px;[^}]*border-radius: 50%;[^}]*background-color: var\(--color-purple-700\)/,
	);
	expect(css).toMatch(
		/@media screen and \(width < 1279px\)\s*\{\s*\.banner-list li\s*\{\s*flex: 1 1 100%/,
	);
});
