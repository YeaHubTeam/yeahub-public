/** @jest-environment-options {"customExportConditions":["development","browser"]} */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { PaymentInitResult } from '@/entities/subscription/index.server';

import subscription from '../../../../../public/locales/ru/subscription.json';
import translation from '../../../../../public/locales/ru/translation.json';
import { SubscribeModal, paymentNavigation, usePaymentCheckout } from './SubscribeModal';
import type { PaymentAction } from './SubscribeModal';
import { TrialToast, useTariffMutationGate, useTrialActivation } from './TrialActivation';

let owner: string | null = 'owner-a';
let sessionStatus = 'authenticated';
const push = jest.fn();
const refresh = jest.fn();
const router = { push, refresh };
jest.mock('next-auth/react', () => ({
	useSession: () => ({ data: owner ? { user: { id: owner } } : null, status: sessionStatus }),
}));
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => router,
}));
const assign = jest.spyOn(paymentNavigation, 'assign').mockImplementation(() => {});
const fetchOriginal = globalThis.fetch;
const backend = jest.fn();
const trial = jest.fn();
const url = 'https://securepay.tinkoff.ru/new/synthetic';
const Harness = ({
	action,
	verified = true,
	email = 'profile@example.invalid',
	visible = true,
}: {
	action: PaymentAction;
	verified?: boolean;
	email?: string | null;
	visible?: boolean;
}) => {
	const gate = useTariffMutationGate();
	const controller = usePaymentCheckout({ action, gate, email, isVerified: verified });
	const trialController = useTrialActivation({
		action: trial,
		eligible: true,
		isVerified: verified,
		sharedGate: gate,
	});
	return (
		<>
			{visible && (
				<>
					<button disabled={!controller.canOpen(2)} onClick={() => controller.open(2)}>
						Month
					</button>
					<button disabled={!controller.canOpen(3)} onClick={() => controller.open(3)}>
						Quarter
					</button>
					<button disabled={trialController.disabled} onClick={trialController.activate}>
						Trial
					</button>
				</>
			)}
			<TrialToast toast={controller.toast} />
			<TrialToast toast={trialController.toast} />
			<SubscribeModal controller={controller} />
		</>
	);
};
const tree = (
	action: PaymentAction,
	options: { verified?: boolean; email?: string | null; visible?: boolean } = {},
) => (
	<NextIntlClientProvider locale="ru" messages={{ subscription, translation }}>
		<Harness action={action} {...options} />
	</NextIntlClientProvider>
);
const defer = () => {
	let resolve!: (value: PaymentInitResult) => void;
	const promise = new Promise<PaymentInitResult>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Month' }));
const agree = () =>
	screen.getAllByRole('checkbox').forEach((box) => {
		if (!(box as HTMLInputElement).checked) fireEvent.click(box);
	});
const submit = () =>
	fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }));
beforeEach(() => {
	owner = 'owner-a';
	sessionStatus = 'authenticated';
	assign.mockReset();
	push.mockClear();
	refresh.mockClear();
	trial.mockReset();
	backend.mockReset();
	globalThis.fetch = backend;
});
afterEach(() => {
	expect(backend).not.toHaveBeenCalled();
	globalThis.fetch = fetchOriginal;
	jest.useRealTimers();
});
it('opens the exact React form without initiating payment and exposes secure localized document links', () => {
	const action = jest.fn();
	render(tree(action));
	open();
	expect(screen.getByRole('dialog', { name: 'Подписка' })).toBeInTheDocument();
	const email = screen.getByRole('textbox');
	expect(email).toHaveValue('profile@example.invalid');
	expect(email).toBeDisabled();
	expect(screen.getByText('Мы используем e-mail для отправки чека и доступа')).toBeInTheDocument();
	expect(screen.getByText('Подписка продлевается автоматически каждый месяц')).toBeInTheDocument();
	expect(
		screen.getByText(
			'Отменить можно в любой момент в разделе «Подписка» доступ сохранится до конца оплаченного периода',
		),
	).toBeInTheDocument();
	expect(screen.getAllByRole('checkbox')).toHaveLength(2);
	for (const link of screen.getAllByRole('link')) {
		expect(link).toHaveAttribute('href', '/ru/docs');
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	}
	expect(screen.getAllByRole('link')).toHaveLength(3);
	expect(
		within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }),
	).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});
it('validates email and both agreements using touched form errors without mutation', async () => {
	const action = jest.fn();
	render(tree(action, { email: null }));
	open();
	const email = screen.getByRole('textbox');
	fireEvent.change(email, { target: { value: 'invalid' } });
	fireEvent.blur(email);
	expect(await screen.findByText('Неверный формат электронной почты')).toBeInTheDocument();
	agree();
	submit();
	await waitFor(() => expect(action).not.toHaveBeenCalled());
	await act(async () => {
		fireEvent.change(email, { target: { value: 'receipt+tag@example.invalid' } });
		fireEvent.click(screen.getAllByRole('checkbox')[0]);
		await Promise.resolve();
	});
	expect(
		within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }),
	).toBeDisabled();
});
it('routes unverified email without payment and accepts fresh verification props', async () => {
	const action = jest.fn().mockResolvedValue({ status: 'success', paymentUrl: url });
	const view = render(tree(action, { verified: false }));
	open();
	agree();
	submit();
	await waitFor(() => expect(push).toHaveBeenCalledWith('/settings#email-verify'));
	expect(action).not.toHaveBeenCalled();
	view.rerender(tree(action, { verified: true }));
	open();
	submit();
	await waitFor(() => expect(assign).toHaveBeenCalledWith(url));
});
it('locks synchronously, survives close and hash panel removal, then reuses the same link only for the same tariff', async () => {
	const pending = defer();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	open();
	agree();
	submit();
	submit();
	await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
	expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
	fireEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
	view.rerender(tree(action, { visible: false }));
	await act(async () => {
		pending.resolve({ status: 'success', paymentUrl: url });
		await pending.promise;
	});
	expect(assign).toHaveBeenCalledTimes(1);
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	view.rerender(tree(action));
	expect(screen.getByRole('button', { name: 'Quarter' })).toBeDisabled();
	open();
	submit();
	await waitFor(() => expect(assign).toHaveBeenCalledTimes(2));
	expect(action).toHaveBeenCalledTimes(1);
});
it.each(['outcome-unknown', 'conflict', 'throw'] as const)(
	'keeps terminal %s across props and panel changes',
	async (status) => {
		const action =
			status === 'throw'
				? jest.fn().mockRejectedValue(new Error('private'))
				: jest.fn().mockResolvedValue({ status });
		const view = render(tree(action));
		open();
		agree();
		submit();
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подключить подписку');
		expect(screen.getByRole('alert')).toHaveTextContent('Ошибка!');
		expect(assign).not.toHaveBeenCalled();
		view.rerender(tree(action, { visible: false }));
		view.rerender(tree(action));
		expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
		submit();
		expect(action).toHaveBeenCalledTimes(1);
	},
);
it.each([
	'invalid-input',
	'unauthenticated',
	'refresh-required',
	'verification-required',
	'not-available',
	'forbidden',
	'error',
] as const)('shows only an error for %s and never navigates to payment', async (status) => {
	const action = jest.fn().mockResolvedValue({ status });
	render(tree(action));
	open();
	agree();
	submit();
	expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подключить подписку');
	expect(assign).not.toHaveBeenCalled();
	expect(refresh).not.toHaveBeenCalled();
	if (status === 'verification-required')
		expect(push).toHaveBeenCalledWith('/settings#email-verify');
});
it('preserves the link when navigation throws and never recreates the bank order', async () => {
	assign.mockImplementationOnce(() => {
		throw new Error('navigation');
	});
	const action = jest.fn().mockResolvedValue({ status: 'success', paymentUrl: url });
	render(tree(action));
	open();
	agree();
	submit();
	expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подключить подписку');
	submit();
	await waitFor(() => expect(assign).toHaveBeenCalledTimes(2));
	expect(action).toHaveBeenCalledTimes(1);
});
it('ignores a late result after identity change and clears the old draft and URL', async () => {
	const pending = defer();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action, { email: null }));
	open();
	fireEvent.change(screen.getByRole('textbox'), { target: { value: 'old@example.invalid' } });
	agree();
	submit();
	await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
	owner = 'owner-b';
	view.rerender(tree(action, { email: null }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	await act(async () => {
		pending.resolve({ status: 'success', paymentUrl: url });
		await pending.promise;
	});
	expect(assign).not.toHaveBeenCalled();
	open();
	expect(screen.getByRole('textbox')).toHaveValue('');
	expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
});
it('does not reset a terminal gate for temporary session loading or ordinary refresh props', async () => {
	const action = jest.fn().mockResolvedValue({ status: 'conflict' });
	const view = render(tree(action));
	open();
	agree();
	submit();
	await screen.findByRole('alert');
	sessionStatus = 'loading';
	owner = null;
	view.rerender(tree(action));
	sessionStatus = 'authenticated';
	owner = 'owner-a';
	view.rerender(tree(action));
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
	submit();
	expect(action).toHaveBeenCalledTimes(1);
});
it('prevents checkout during trial and preserves its success toast and single refresh', async () => {
	let resolve!: (value: { status: 'success' }) => void;
	trial.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const action = jest.fn();
	render(tree(action));
	fireEvent.click(screen.getByRole('button', { name: 'Trial' }));
	expect(screen.getByRole('button', { name: 'Month' })).toBeDisabled();
	await act(async () => {
		resolve({ status: 'success' });
		await Promise.resolve();
	});
	expect(screen.getByRole('status')).toHaveTextContent(
		'You have successfully connected a trial subscription',
	);
	expect(refresh).toHaveBeenCalledTimes(1);
	expect(action).not.toHaveBeenCalled();
});
it('expires the checkout error toast after 3000ms without resetting a terminal gate', async () => {
	jest.useFakeTimers();
	const action = jest.fn().mockResolvedValue({ status: 'outcome-unknown' });
	render(tree(action));
	open();
	agree();
	await act(async () => {
		submit();
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toBeInTheDocument();
	act(() => jest.advanceTimersByTime(2999));
	expect(screen.getByRole('alert')).toBeInTheDocument();
	act(() => jest.advanceTimersByTime(1));
	expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
});

jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: () => '/ru/settings',
	useRouter: () => router,
}));

it('keeps the React desktop size and a viewport-safe mobile width', () => {
	const css = readFileSync(join(__dirname, 'SubscribeModal.module.css'), 'utf8');
	expect(css).toMatch(/padding: 20px/);
	expect(css).toMatch(/width: 448px/);
	expect(css).toMatch(/@media \(width < 480px\)/);
	expect(css).toMatch(/width: calc\(100vw - 40px\)/);
});
it('checks the shared gate again when form validation overlaps a trial click', async () => {
	trial.mockReturnValue(new Promise(() => {}));
	const action = jest.fn();
	render(tree(action));
	open();
	agree();
	await act(async () => {
		submit();
		fireEvent.click(screen.getByRole('button', { name: 'Trial' }));
		await Promise.resolve();
	});
	expect(trial).toHaveBeenCalledTimes(1);
	expect(action).not.toHaveBeenCalled();
});
it('ignores checkout success after unmount', async () => {
	const pending = defer();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	open();
	agree();
	submit();
	await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
	view.unmount();
	await act(async () => {
		pending.resolve({ status: 'success', paymentUrl: url });
		await pending.promise;
	});
	expect(assign).not.toHaveBeenCalled();
});

it('cleans the active checkout toast timer on unmount', async () => {
	jest.useFakeTimers();
	const timeout = jest.spyOn(globalThis, 'setTimeout');
	const clear = jest.spyOn(globalThis, 'clearTimeout');
	const action = jest.fn().mockResolvedValue({ status: 'conflict' });
	const view = render(tree(action));
	open();
	agree();
	await act(async () => {
		submit();
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toBeInTheDocument();
	const index = timeout.mock.calls.findIndex((call) => call[1] === 3000);
	expect(index).toBeGreaterThanOrEqual(0);
	const timer = timeout.mock.results[index].value;
	view.unmount();
	expect(clear).toHaveBeenCalledWith(timer);
	timeout.mockRestore();
	clear.mockRestore();
});

it('retains the server email when the initial session finishes loading', () => {
	sessionStatus = 'loading';
	owner = null;
	const action = jest.fn();
	const view = render(tree(action));
	expect(screen.getByRole('button', { name: 'Month' })).toBeDisabled();
	sessionStatus = 'authenticated';
	owner = 'owner-a';
	view.rerender(tree(action));
	open();
	expect(screen.getByRole('textbox')).toHaveValue('profile@example.invalid');
	expect(screen.getByRole('textbox')).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});

it('renders both Russian rich agreements through the runtime provider in development without unresolved keys', () => {
	const onError = jest.fn();
	const action = jest.fn();
	render(
		<NextIntlClientProvider locale="ru" messages={{ subscription, translation }} onError={onError}>
			<Harness action={action} />
		</NextIntlClientProvider>,
	);
	open();
	const dialog = screen.getByRole('dialog', { name: 'Подписка' });
	expect(within(dialog).getByRole('textbox')).toHaveAttribute(
		'placeholder',
		'Укажите e-mail для получения чека',
	);
	expect(
		within(dialog).getByText('Мы используем e-mail для отправки чека и доступа'),
	).toBeInTheDocument();
	expect(
		within(dialog).getByText('Подписка продлевается автоматически каждый месяц'),
	).toBeInTheDocument();
	expect(
		within(dialog).getByText(
			'Отменить можно в любой момент в разделе «Подписка» доступ сохранится до конца оплаченного периода',
		),
	).toBeInTheDocument();
	expect(
		within(dialog).getByText('Проставив галочку («✔») и нажимая «Подписаться»:'),
	).toBeInTheDocument();
	expect(
		within(dialog)
			.getAllByRole('link')
			.map((link) => link.textContent?.trim()),
	).toEqual(['Договором-офертой', 'Соглашением о подписке', 'сохранение учетных данных']);
	expect(dialog.textContent).not.toMatch(
		/subscription\.subscribe\.modal|subscribe\.modal|processingLink|translation\.validation/,
	);
	expect(
		within(dialog).getByRole('checkbox', { name: /Я подтверждаю что ознакомился/ }),
	).toBeInTheDocument();
	expect(
		within(dialog).getByRole('checkbox', { name: /Разрешаю сохранение учетных данных/ }),
	).toBeInTheDocument();
	for (const link of within(dialog).getAllByRole('link')) {
		expect(link).toHaveAttribute('href', '/ru/docs');
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	}
	for (const box of within(dialog).getAllByRole('checkbox'))
		expect(box.closest('label')?.parentElement).toHaveClass('form-control');
	expect(onError).not.toHaveBeenCalled();
	expect(action).not.toHaveBeenCalled();
	const css = readFileSync(join(__dirname, 'SubscribeModal.module.css'), 'utf8');
	expect(css).toMatch(/\.form-control label\s*\{[^}]*gap: 10px/);
	expect(css).toMatch(/&::placeholder\s*\{[^}]*color: var\(--color-black-900\)/);
});
