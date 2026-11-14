import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { SubscriptionCancellationResult } from '@/entities/subscription/index.server';

import subscription from '../../../../../public/locales/ru/subscription.json';
import translation from '../../../../../public/locales/ru/translation.json';
import { CurrentSubscriptionInfo } from './CurrentSubscriptionInfo';
import type { CurrentSubscriptionView } from './CurrentSubscriptionInfo';
import { SubscribeModal, usePaymentCheckout } from './SubscribeModal';
import { TrialToast, useTariffMutationGate, useTrialActivation } from './TrialActivation';
import { UnsubscribeModal, useSubscriptionCancellation } from './UnsubscribeModal';
import type { CancellationAction } from './UnsubscribeModal';

const id = '22222222-2222-4222-8222-222222222222';
const otherId = '33333333-3333-4333-8333-333333333333';
const active = {
	state: 'active' as const,
	daysLeft: 7,
	daysInCreationMonth: 31,
	endDateLabel: '1 февраля 2030',
};
const success = {
	status: 'success' as const,
	subscription: { ...active, state: 'canceled' as const },
};
let owner: string | null = 'owner-a';
let sessionStatus = 'authenticated';
const refresh = jest.fn();
const push = jest.fn();
const router = { refresh, push };
const trial = jest.fn();
const payment = jest.fn();
jest.mock('next-auth/react', () => ({
	useSession: () => ({ data: owner ? { user: { id: owner } } : null, status: sessionStatus }),
}));
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => router,
}));
jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: () => '/ru/settings',
	useRouter: () => router,
}));
const Harness = ({
	action,
	target = id,
	view = active,
	visible = true,
}: {
	action: CancellationAction;
	target?: string | null;
	view?: CurrentSubscriptionView;
	visible?: boolean;
}) => {
	const gate = useTariffMutationGate();
	const controller = useSubscriptionCancellation({
		action,
		gate,
		expectedSubscriptionId: target,
		subscription: view,
	});
	const trialController = useTrialActivation({
		action: trial,
		eligible: true,
		isVerified: true,
		sharedGate: gate,
	});
	const checkout = usePaymentCheckout({
		action: payment,
		gate,
		email: 'synthetic@example.invalid',
		isVerified: true,
	});
	return (
		<>
			<button onClick={trialController.activate} disabled={trialController.disabled}>
				Trial
			</button>
			<button onClick={() => checkout.open(2)} disabled={!checkout.canOpen(2)}>
				Checkout
			</button>
			{visible && controller.subscription && (
				<CurrentSubscriptionInfo
					subscription={controller.subscription}
					onCancel={controller.open}
					cancelDisabled={!controller.canOpen}
				/>
			)}
			<TrialToast toast={controller.toast ?? trialController.toast} />
			<SubscribeModal controller={checkout} />
			<UnsubscribeModal controller={controller} />
		</>
	);
};
const tree = (
	action: CancellationAction,
	props: { target?: string | null; view?: CurrentSubscriptionView; visible?: boolean } = {},
) => (
	<NextIntlClientProvider locale="ru" messages={{ subscription, translation }}>
		<Harness action={action} {...props} />
	</NextIntlClientProvider>
);
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));
const yes = () =>
	fireEvent.click(
		within(screen.getByRole('dialog', { name: 'Отключение подписки' })).getByRole('button', {
			name: 'Да',
		}),
	);
const deferred = () => {
	let resolve!: (value: SubscriptionCancellationResult) => void;
	const promise = new Promise<SubscriptionCancellationResult>((done) => {
		resolve = done;
	});
	return { resolve, promise };
};
const originalFetch = globalThis.fetch;
const backend = jest.fn();
beforeEach(() => {
	owner = 'owner-a';
	sessionStatus = 'authenticated';
	trial.mockReset();
	payment.mockReset();
	refresh.mockClear();
	push.mockClear();
	backend.mockReset();
	globalThis.fetch = backend;
});
afterEach(() => {
	expect(backend).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
	jest.useRealTimers();
});
it('opens the exact React warning as plain text without cancellation or HTML interpretation', () => {
	const action = jest.fn();
	render(tree(action));
	open();
	const dialog = screen.getByRole('dialog', { name: 'Отключение подписки' });
	expect(dialog).toHaveClass('variant-error-modal');
	expect(dialog.textContent).toContain(subscription.unsubscribe.modal.description);
	expect(dialog.querySelector('b')).toBeNull();
	expect(within(dialog).getByRole('button', { name: 'Да' })).toHaveClass('button-destructive');
	expect(within(dialog).getByRole('button', { name: 'Нет' })).toHaveClass(
		'button-destructive-outline',
	);
	expect(action).not.toHaveBeenCalled();
});
it.each(['no', 'cross', 'escape', 'backdrop'] as const)(
	'closes by %s and reopens with focus restored without mutation',
	(method) => {
		const action = jest.fn();
		render(tree(action));
		const opener = screen.getByRole('button', { name: 'Отменить подписку' });
		opener.focus();
		open();
		if (method === 'no') fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
		if (method === 'cross')
			fireEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
		if (method === 'escape') fireEvent.keyDown(document, { key: 'Escape' });
		if (method === 'backdrop') fireEvent.click(screen.getByTestId('Modal_Overlay'));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(opener).toHaveFocus();
		open();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(action).not.toHaveBeenCalled();
	},
);
it('holds the shared gate through double confirmation and manual pending close, then applies confirmed projection without refresh', async () => {
	const pending = deferred();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	open();
	yes();
	yes();
	expect(action).toHaveBeenCalledTimes(1);
	expect(action).toHaveBeenCalledWith(id);
	expect(screen.getByRole('button', { name: 'Да' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Нет' })).not.toBeDisabled();
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
	fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
	view.rerender(tree(action, { visible: false }));
	view.rerender(tree(action));
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
	await act(async () => {
		pending.resolve(success);
		await pending.promise;
	});
	expect(screen.getByRole('status')).toHaveTextContent('Подписка отключена');
	expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
	expect(screen.getByText('Осталось 7 дней')).toBeInTheDocument();
	expect(
		screen.getByText('Вы отменили подписку. Полный доступ сохранится до 1 февраля 2030.'),
	).toBeInTheDocument();
	expect(refresh).not.toHaveBeenCalled();
	expect(action).toHaveBeenCalledTimes(1);
	view.rerender(tree(action));
	expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
});
it.each(['incomplete', 'outcome-unknown', 'conflict', 'throw'] as const)(
	'holds terminal %s through new props and hash panel removal',
	async (status) => {
		const action =
			status === 'throw'
				? jest.fn().mockRejectedValue(new Error('Private'))
				: jest.fn().mockResolvedValue({ status });
		const view = render(tree(action));
		open();
		yes();
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отключить подписку');
		expect(
			screen.getByText('Платеж будет продлен автоматически 1 февраля 2030'),
		).toBeInTheDocument();
		view.rerender(tree(action, { visible: false }));
		view.rerender(tree(action));
		yes();
		expect(action).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
		expect(refresh).not.toHaveBeenCalled();
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
] as const)('shows error for safe %s without changing subscription', async (status) => {
	const action = jest.fn().mockResolvedValue({ status });
	render(tree(action));
	open();
	yes();
	expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отключить подписку');
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(screen.getByText('Платеж будет продлен автоматически 1 февраля 2030')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Да' })).not.toBeDisabled();
});
it('ignores late success after identity change and does not reuse the old modal target', async () => {
	const pending = deferred();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	open();
	yes();
	owner = 'owner-b';
	view.rerender(tree(action, { target: otherId }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	await act(async () => {
		pending.resolve(success);
		await pending.promise;
	});
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(screen.getByText('Платеж будет продлен автоматически 1 февраля 2030')).toBeInTheDocument();
	open();
	expect(screen.getByRole('button', { name: 'Да' })).not.toBeDisabled();
});
it('retains terminal gate across temporary session loading and clears local result on logout', async () => {
	const action = jest.fn().mockResolvedValue(success);
	const view = render(tree(action));
	open();
	yes();
	await screen.findByRole('status');
	sessionStatus = 'loading';
	owner = null;
	view.rerender(tree(action));
	sessionStatus = 'authenticated';
	owner = 'owner-a';
	view.rerender(tree(action));
	expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
	sessionStatus = 'unauthenticated';
	owner = null;
	view.rerender(tree(action));
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
it('does not apply local canceled projection to a new subscription of the same identity', async () => {
	const action = jest.fn().mockResolvedValue(success);
	const view = render(tree(action));
	open();
	yes();
	await screen.findByRole('status');
	view.rerender(tree(action, { target: otherId }));
	expect(screen.getByText('Платеж будет продлен автоматически 1 февраля 2030')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
});
it('accepts a newer active period for the same UUID without reopening the terminal gate', async () => {
	const action = jest.fn().mockResolvedValue(success);
	const view = render(tree(action));
	open();
	yes();
	await screen.findByRole('status');
	for (const endDateLabel of [active.endDateLabel, '1 января 2030']) {
		view.rerender(tree(action, { view: { ...active, daysLeft: 6, endDateLabel } }));
		expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
	}
	view.rerender(tree(action, { view: { ...active, endDateLabel: '1 марта 2030' } }));
	expect(screen.getByText('Платеж будет продлен автоматически 1 марта 2030')).toBeInTheDocument();
	const cancel = screen.getByRole('button', { name: 'Отменить подписку' });
	expect(cancel).toBeDisabled();
	fireEvent.click(cancel);
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
	expect(refresh).not.toHaveBeenCalled();
});
it('does not cancel a changed UUID after the modal was opened', () => {
	const action = jest.fn();
	const view = render(tree(action));
	open();
	view.rerender(tree(action, { target: otherId }));
	expect(screen.getByRole('button', { name: 'Да' })).toBeDisabled();
	yes();
	expect(action).not.toHaveBeenCalled();
});
it('prevents cancellation while trial is pending', () => {
	trial.mockReturnValue(new Promise(() => {}));
	const action = jest.fn();
	render(tree(action));
	fireEvent.click(screen.getByRole('button', { name: 'Trial' }));
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
	open();
	expect(action).not.toHaveBeenCalled();
});
it('prevents cancellation while payment-init is pending', async () => {
	payment.mockReturnValue(new Promise(() => {}));
	const action = jest.fn();
	render(tree(action));
	fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
	screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box));
	fireEvent.click(
		within(screen.getByRole('dialog', { name: 'Подписка' })).getByRole('button', {
			name: 'Подписаться',
		}),
	);
	await waitFor(() => expect(payment).toHaveBeenCalledTimes(1));
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});
it('expires the success toast at 3000ms without unlocking a confirmed cancellation', async () => {
	jest.useFakeTimers();
	const action = jest.fn().mockResolvedValue(success);
	render(tree(action));
	open();
	await act(async () => {
		yes();
		await Promise.resolve();
	});
	act(() => jest.advanceTimersByTime(2999));
	expect(screen.getByRole('status')).toBeInTheDocument();
	act(() => jest.advanceTimersByTime(1));
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Trial' })).toBeDisabled();
});
it('ignores a response after unmount', async () => {
	const pending = deferred();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	open();
	yes();
	view.unmount();
	await act(async () => {
		pending.resolve(success);
		await pending.promise;
	});
	expect(refresh).not.toHaveBeenCalled();
});
it('retains the React desktop width and adds only viewport-safe sizing', () => {
	const css = readFileSync(join(__dirname, 'UnsubscribeModal.module.css'), 'utf8');
	expect(css).toMatch(/width: 553px/);
	expect(css).toMatch(/@media \(width < 480px\)/);
});
