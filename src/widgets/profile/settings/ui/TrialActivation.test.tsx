import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import type { TrialResult } from '@/entities/subscription/index.server';

import translation from '../../../../../public/locales/ru/translation.json';
import { TrialToast, useTariffMutationGate, useTrialActivation } from './TrialActivation';
import type { TrialAction } from './TrialActivation';

let identity: string | null = 'owner-a';
let sessionStatus = 'authenticated';
const push = jest.fn();
const refresh = jest.fn();
jest.mock('next-auth/react', () => ({
	useSession: () => ({ data: identity ? { user: { id: identity } } : null, status: sessionStatus }),
}));
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => ({ push, refresh }),
}));
const Harness = ({
	action,
	verified = true,
	eligible = true,
}: {
	action: TrialAction;
	verified?: boolean;
	eligible?: boolean;
}) => {
	const sharedGate = useTariffMutationGate();
	const controller = useTrialActivation({ action, eligible, isVerified: verified, sharedGate });
	return (
		<>
			<button
				disabled={controller.disabled}
				aria-busy={controller.pending}
				onClick={controller.activate}
			>
				Trial
			</button>
			<TrialToast toast={controller.toast} />
		</>
	);
};
const tree = (action: TrialAction, verified = true, eligible = true) => (
	<NextIntlClientProvider locale="ru" messages={{ translation }}>
		<Harness action={action} verified={verified} eligible={eligible} />
	</NextIntlClientProvider>
);
const deferred = () => {
	let resolve!: (value: TrialResult) => void;
	const promise = new Promise<TrialResult>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};
const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;
beforeEach(() => {
	identity = 'owner-a';
	sessionStatus = 'authenticated';
	push.mockClear();
	refresh.mockClear();
	fetchMock = jest.fn();
	globalThis.fetch = fetchMock;
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
	jest.useRealTimers();
});
it('does nothing during render and routes unverified email without mutation', () => {
	const action = jest.fn();
	render(tree(action, false));
	expect(action).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Trial' }));
	expect(action).not.toHaveBeenCalled();
	expect(push).toHaveBeenCalledWith('/settings#email-verify');
	expect(refresh).not.toHaveBeenCalled();
});
it('uses a synchronous gate for double clicks, success toast, terminal props and exactly one refresh', async () => {
	const pending = deferred();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	const button = screen.getByRole('button');
	fireEvent.click(button);
	fireEvent.click(button);
	expect(action).toHaveBeenCalledTimes(1);
	expect(action).toHaveBeenCalledWith();
	expect(button).toBeDisabled();
	expect(button).toHaveAttribute('aria-busy', 'true');
	expect(refresh).not.toHaveBeenCalled();
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(screen.getByRole('status')).toHaveTextContent('Успешно!');
	expect(screen.getByRole('status')).toHaveTextContent(
		'You have successfully connected a trial subscription',
	);
	expect(refresh).toHaveBeenCalledTimes(1);
	view.rerender(tree(jest.fn()));
	fireEvent.click(screen.getByRole('button'));
	expect(action).toHaveBeenCalledTimes(1);
	expect(refresh).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('button')).toBeDisabled();
});
it.each(['incomplete', 'outcome-unknown', 'throw'])(
	'locks %s until reload, including new props',
	async (status) => {
		const action = jest.fn();
		if (status === 'throw') action.mockRejectedValue(new Error('Private'));
		else action.mockResolvedValue({ status });
		const view = render(tree(action));
		await act(async () => {
			fireEvent.click(screen.getByRole('button'));
			await Promise.resolve();
		});
		expect(screen.getByRole('alert')).toHaveTextContent('Ошибка!');
		expect(screen.getByRole('alert')).toHaveTextContent('Failed to connect trial subscription');
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
		view.rerender(tree(action));
		fireEvent.click(screen.getByRole('button'));
		expect(action).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('button')).toBeDisabled();
		expect(refresh).not.toHaveBeenCalled();
	},
);
it.each([
	'unauthenticated',
	'refresh-required',
	'verification-required',
	'not-eligible',
	'forbidden',
	'conflict',
	'error',
] as const)('shows only an error toast for expected %s and does not refresh', async (status) => {
	const action = jest.fn().mockResolvedValue({ status });
	render(tree(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toHaveTextContent('Failed to connect trial subscription');
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(refresh).not.toHaveBeenCalled();
	if (status === 'verification-required')
		expect(push).toHaveBeenCalledWith('/settings#email-verify');
	expect(screen.getByRole('button')).not.toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
});
it('expires toast at 3000ms and replaces its timer after another refusal', async () => {
	jest.useFakeTimers();
	const action = jest.fn().mockResolvedValue({ status: 'error' });
	const view = render(tree(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
		await Promise.resolve();
	});
	act(() => jest.advanceTimersByTime(2000));
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
		await Promise.resolve();
	});
	act(() => jest.advanceTimersByTime(2999));
	expect(screen.getByRole('alert')).toBeInTheDocument();
	act(() => jest.advanceTimersByTime(1));
	expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	view.unmount();
	expect(jest.getTimerCount()).toBe(0);
});
it('clears success toast after three seconds without unlocking the confirmed operation', async () => {
	jest.useFakeTimers();
	const action = jest.fn().mockResolvedValue({ status: 'success' });
	render(tree(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
		await Promise.resolve();
	});
	act(() => jest.advanceTimersByTime(3000));
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(screen.getByRole('button')).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
});
it('clears old identity state and rejects late responses without clearing the same-identity terminal gate', async () => {
	const old = deferred();
	const action = jest
		.fn()
		.mockReturnValueOnce(old.promise)
		.mockResolvedValue({ status: 'success' });
	const view = render(tree(action));
	fireEvent.click(screen.getByRole('button'));
	identity = 'owner-b';
	view.rerender(tree(action));
	expect(screen.getByRole('button')).not.toBeDisabled();
	await act(async () => {
		old.resolve({ status: 'success' });
		await old.promise;
	});
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(refresh).not.toHaveBeenCalled();
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
		await Promise.resolve();
	});
	expect(refresh).toHaveBeenCalledTimes(1);
	sessionStatus = 'loading';
	identity = null;
	view.rerender(tree(action));
	sessionStatus = 'authenticated';
	identity = 'owner-b';
	view.rerender(tree(action));
	expect(screen.getByRole('button')).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(2);
	identity = null;
	sessionStatus = 'unauthenticated';
	view.rerender(tree(action));
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
it('ignores responses after unmount and clears toast timers', async () => {
	const pending = deferred();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = render(tree(action));
	fireEvent.click(screen.getByRole('button'));
	view.unmount();
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(refresh).not.toHaveBeenCalled();
});
it('does not call the action while the gate is unavailable or after becoming ineligible', () => {
	const action = jest.fn();
	render(tree(action, true, false));
	expect(screen.getByRole('button')).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});

it('clears an active toast timer when the shell unmounts', async () => {
	jest.useFakeTimers();
	const timeout = jest.spyOn(globalThis, 'setTimeout');
	const clear = jest.spyOn(globalThis, 'clearTimeout');
	const action = jest.fn().mockResolvedValue({ status: 'error' });
	const view = render(tree(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button'));
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

it.each(['success', 'error'] as const)(
	'uses the shared toast with exact unsubscribe %s text',
	(variant) => {
		render(
			<NextIntlClientProvider locale="ru" messages={{ translation }}>
				<TrialToast toast={{ variant, cancellation: true }} />
			</NextIntlClientProvider>,
		);
		expect(screen.getByRole(variant === 'success' ? 'status' : 'alert')).toHaveTextContent(
			variant === 'success' ? 'Подписка отключена' : 'Не удалось отключить подписку',
		);
	},
);
