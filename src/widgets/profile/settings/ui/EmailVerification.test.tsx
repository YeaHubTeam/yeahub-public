import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import header from '../../../../../public/locales/ru/header.json';
import profile from '../../../../../public/locales/ru/profile.json';
import { SettingsShell } from '../index';
import type { ReadResult, SendResult } from './EmailVerification';

const replace = jest.fn();
const router = { replace };
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => router,
}));
const send = jest.fn<Promise<SendResult>, []>();
const read = jest.fn<Promise<ReadResult>, []>();
const actions = { send, read };
const mount = (email: string | null = 'test@example.invalid', isVerified = false) =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header }}>
			<SettingsShell emailVerification={{ email, isVerified, actions }} />
		</NextIntlClientProvider>,
	);
const button = () => screen.getByRole('button', { name: 'Подтвердить' });
const clickSend = async () => {
	await act(async () => {
		fireEvent.click(button());
		await Promise.resolve();
	});
};
const advance = async (ms: number) => {
	await act(async () => {
		await jest.advanceTimersByTimeAsync(ms);
	});
};
beforeEach(() => {
	jest.useFakeTimers();
	window.history.replaceState(null, '', '/ru/settings#email-verify');
	send.mockReset().mockResolvedValue({ status: 'success' });
	read.mockReset().mockResolvedValue({ status: 'success', isVerified: false });
	replace.mockClear();
});
afterEach(() => {
	jest.useRealTimers();
});
it('renders React text, disabled email, and does not read or send on mount', () => {
	mount();
	expect(screen.getByLabelText('Введите e-mail')).toHaveValue('test@example.invalid');
	expect(screen.getByLabelText('Введите e-mail')).toBeDisabled();
	expect(screen.getByText('Подтвердите ваш e-mail')).toBeInTheDocument();
	expect(send).not.toHaveBeenCalled();
	expect(read).not.toHaveBeenCalled();
});
it('renders verified state without polling', async () => {
	mount('test@example.invalid', true);
	await advance(310000);
	expect(screen.getByText('Почта успешно подтверждена')).toBeInTheDocument();
	expect(read).not.toHaveBeenCalled();
	expect(screen.queryByRole('button', { name: 'Подтвердить' })).not.toBeInTheDocument();
});
it.each([null, ''])('disables sending without email %#', (email) => {
	mount(email);
	expect(button()).toBeDisabled();
	expect(screen.getByText('Email не указан.')).toBeInTheDocument();
});
it('blocks double click while pending', async () => {
	let resolve!: (value: SendResult) => void;
	send.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	mount();
	fireEvent.click(button());
	fireEvent.click(button());
	expect(send).toHaveBeenCalledTimes(1);
	expect(button()).toBeDisabled();
	await act(async () => {
		resolve({ status: 'error' });
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toBeInTheDocument();
});
it('shows success, enforces 60 seconds across tab remount, and never automatically sends', async () => {
	mount();
	await clickSend();
	expect(screen.getByRole('status')).toHaveTextContent('Письмо успешно отправлено на почту');
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	await advance(30000);
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	expect(screen.getByRole('status')).toBeInTheDocument();
	await advance(29999);
	expect(screen.queryByRole('button', { name: 'Подтвердить' })).not.toBeInTheDocument();
	await advance(1001);
	expect(button()).toBeEnabled();
	expect(send).toHaveBeenCalledTimes(1);
	expect(read).not.toHaveBeenCalled();
});
it.each(['rate-limited', 'forbidden', 'error', 'refresh-required', 'unauthenticated'] as const)(
	'handles %s without false success',
	async (status) => {
		send.mockResolvedValue({ status });
		mount();
		await clickSend();
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
		if (status === 'rate-limited') {
			expect(button()).toBeDisabled();
			await advance(61000);
			expect(button()).toBeEnabled();
		}
		if (status === 'unauthenticated') expect(replace).toHaveBeenCalled();
		expect(read).not.toHaveBeenCalled();
	},
);
it.each([true, false])('checks already-verified before showing verified %s', async (isVerified) => {
	send.mockResolvedValue({ status: 'already-verified' });
	read.mockResolvedValue({ status: 'success', isVerified });
	mount();
	await clickSend();
	expect(read).toHaveBeenCalledTimes(1);
	expect(!!screen.queryByText('Почта успешно подтверждена')).toBe(isVerified);
});
it('polls every 5 seconds, stops at 60, and never sends again', async () => {
	mount();
	await clickSend();
	await advance(4999);
	expect(read).not.toHaveBeenCalled();
	await advance(1);
	expect(read).toHaveBeenCalledTimes(1);
	await advance(295000);
	expect(read).toHaveBeenCalledTimes(60);
	await advance(60000);
	expect(read).toHaveBeenCalledTimes(60);
	expect(send).toHaveBeenCalledTimes(1);
});
it('stops on verified and never downgrades it', async () => {
	read.mockResolvedValue({ status: 'success', isVerified: true });
	mount();
	await clickSend();
	await advance(5000);
	expect(screen.getByText('Почта успешно подтверждена')).toBeInTheDocument();
	await advance(300000);
	expect(read).toHaveBeenCalledTimes(1);
});
it('does not overlap slow reads and ignores their result after unmount', async () => {
	let resolve!: (value: ReadResult) => void;
	read.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	const view = mount();
	await clickSend();
	await advance(5000);
	await advance(20000);
	expect(read).toHaveBeenCalledTimes(1);
	view.unmount();
	await act(async () => {
		resolve({ status: 'success', isVerified: true });
		await Promise.resolve();
	});
	await advance(300000);
	expect(read).toHaveBeenCalledTimes(1);
});
it.each(['forbidden', 'error', 'refresh-required', 'unauthenticated'] as const)(
	'stops polling on %s',
	async (status) => {
		read.mockResolvedValue({ status });
		mount();
		await clickSend();
		await advance(100000);
		expect(read).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('alert')).toBeInTheDocument();
	},
);
it('keeps pending and cooldown if leaving the tab during send', async () => {
	let resolve!: (value: SendResult) => void;
	send.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	mount();
	fireEvent.click(button());
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	expect(button()).toBeDisabled();
	await act(async () => {
		resolve({ status: 'success' });
		await Promise.resolve();
	});
	expect(screen.getByRole('status')).toBeInTheDocument();
	expect(send).toHaveBeenCalledTimes(1);
	await advance(10000);
	expect(read).not.toHaveBeenCalled();
});

it('preserves the email on a rejected send without starting polling', async () => {
	send.mockRejectedValue(new Error('private error'));
	mount();
	await clickSend();
	expect(screen.getByRole('alert')).toHaveTextContent(
		'Не удалось проверить почту или отправить письмо. Попробуйте позже.',
	);
	expect(screen.getByLabelText('Введите e-mail')).toHaveValue('test@example.invalid');
	expect(button()).toBeEnabled();
	await advance(300000);
	expect(read).not.toHaveBeenCalled();
});
it('stops polling on a rejected read and clears timers on unmount', async () => {
	read.mockRejectedValue(new Error('private error'));
	const view = mount();
	await clickSend();
	await advance(100000);
	expect(read).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('alert')).toBeInTheDocument();
	view.unmount();
	expect(jest.getTimerCount()).toBe(0);
});
it.each(['forbidden', 'error', 'refresh-required', 'unauthenticated'] as const)(
	'does not trust already-verified when readback is %s',
	async (status) => {
		send.mockResolvedValue({ status: 'already-verified' });
		read.mockResolvedValue({ status });
		mount();
		await clickSend();
		expect(read).toHaveBeenCalledTimes(1);
		expect(screen.queryByText('Почта успешно подтверждена')).not.toBeInTheDocument();
		expect(screen.getByRole('alert')).toBeInTheDocument();
	},
);
