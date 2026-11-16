import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import type { TelegramMutationResult } from '@/entities/profile';

import header from '../../../../../public/locales/ru/header.json';
import profile from '../../../../../public/locales/ru/profile.json';
import { SettingsShell } from '../index';
import type { ReadResult, SendResult } from './EmailVerification';

jest.mock('next-auth/react', () => ({
	useSession: () => ({
		data: { user: { id: '11111111-1111-4111-8111-111111111111' } },
		status: 'authenticated',
	}),
}));

const replace = jest.fn();
const router = { replace };
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => router,
}));
const link = jest.fn<Promise<TelegramMutationResult>, [unknown]>();
const unlink = jest.fn<Promise<TelegramMutationResult>, []>();
const actions = { link, unlink };
const sendEmail = jest.fn<Promise<SendResult>, []>();
const readEmail = jest.fn<Promise<ReadResult>, []>();
const mount = (
	telegramUsername: string | null = null,
	botUsername: string | null = 'SyntheticBot',
	withEmail = false,
) =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header }}>
			<SettingsShell
				emailVerification={
					withEmail
						? {
								email: 'test@example.invalid',
								isVerified: false,
								actions: { send: sendEmail, read: readEmail },
							}
						: undefined
				}
				telegramVerification={{ telegramUsername, botUsername, actions }}
			/>
		</NextIntlClientProvider>,
	);
const payload = { id: 123, first_name: ' Test ', hash: 'a'.repeat(64), auth_date: 1800000000 };
const widgetCallback = () => {
	const script = document.querySelector('script[data-telegram-login]')!;
	const name = script.getAttribute('data-onauth')!.split('(')[0];
	return (window as unknown as Record<string, (data: unknown) => void>)[name];
};
const authenticate = async () => {
	const callback = widgetCallback();
	await act(async () => {
		callback(payload);
		await Promise.resolve();
	});
};
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Отвязать аккаунт' }));
const confirm = async () => {
	await act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Да' }));
		await Promise.resolve();
	});
};
beforeEach(() => {
	window.history.replaceState(null, '', '/ru/settings#email-verify');
	link.mockReset().mockResolvedValue({ status: 'success', telegramUsername: 'new_user' });
	unlink.mockReset().mockResolvedValue({ status: 'success', telegramUsername: null });
	replace.mockClear();
	sendEmail.mockReset().mockResolvedValue({ status: 'success' });
	readEmail.mockReset().mockResolvedValue({ status: 'success', isVerified: false });
});
it('renders unlinked text and widget without requests on mount', () => {
	mount();
	expect(screen.getByText('Telegram не подключён')).toBeInTheDocument();
	expect(document.querySelector('script[data-telegram-login]')).toBeInTheDocument();
	expect(link).not.toHaveBeenCalled();
	expect(unlink).not.toHaveBeenCalled();
});
it('renders linked state and permits unlink without widget config', () => {
	mount('existing', null);
	expect(screen.getByText('@existing')).toBeInTheDocument();
	expect(screen.getByText('Проверено')).toBeInTheDocument();
	expect(document.querySelector('script')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Отвязать аккаунт' })).toBeEnabled();
});
it('shows unavailability instead of empty widget or broken button', () => {
	mount(null, null);
	expect(screen.getByText('Подключение Telegram временно недоступно.')).toBeInTheDocument();
	expect(document.querySelector('script')).toBeNull();
});
it.each(['new_user', null])(
	'keeps successful link %# across tab changes',
	async (telegramUsername) => {
		link.mockResolvedValue({ status: 'success', telegramUsername });
		mount();
		await authenticate();
		expect(link).toHaveBeenCalledWith(payload);
		expect(screen.getByText('Telegram подтверждён')).toBeInTheDocument();
		expect(
			screen.getByText('Telegram-аккаунт успешно привязан к Вашему аккаунту!'),
		).toBeInTheDocument();
		expect(screen.queryByText('@null')).not.toBeInTheDocument();
		if (telegramUsername) expect(screen.getByText('@new_user')).toBeInTheDocument();
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		expect(screen.getByText('Telegram подтверждён')).toBeInTheDocument();
		expect(link).toHaveBeenCalledTimes(1);
		expect(unlink).not.toHaveBeenCalled();
	},
);
it('blocks duplicate callbacks and removes widget while link is pending', async () => {
	let resolve!: (value: TelegramMutationResult) => void;
	link.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	mount();
	const callback = widgetCallback();
	act(() => {
		callback(payload);
		callback(payload);
	});
	expect(link).toHaveBeenCalledTimes(1);
	expect(document.querySelector('script')).toBeNull();
	expect(screen.getByText('Выполняем запрос…')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	expect(document.querySelector('script')).toBeNull();
	await act(async () => {
		resolve({ status: 'success', telegramUsername: null });
		await Promise.resolve();
	});
	expect(screen.getByText('Telegram подтверждён')).toBeInTheDocument();
});
it('cancels modal without mutation, then confirms unlink', async () => {
	mount('existing');
	open();
	expect(
		screen.getByText('Вы действительно хотите отвязать Telegram от Вашего аккаунта?'),
	).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
	expect(unlink).not.toHaveBeenCalled();
	open();
	await confirm();
	expect(unlink).toHaveBeenCalledTimes(1);
	expect(unlink).toHaveBeenCalledWith();
	expect(screen.getByText('Telegram не подключён')).toBeInTheDocument();
	expect(screen.getByText('Telegram успешно отвязан от Вашего аккаунта')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	expect(screen.getByText('Telegram не подключён')).toBeInTheDocument();
});
it('blocks repeated unlink and preserves state on failure', async () => {
	let resolve!: (value: TelegramMutationResult) => void;
	unlink.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	mount('existing');
	open();
	await confirm();
	expect(screen.getByRole('button', { name: 'Отвязать аккаунт' })).toBeDisabled();
	expect(unlink).toHaveBeenCalledTimes(1);
	await act(async () => {
		resolve({ status: 'unlink-forbidden' });
		await Promise.resolve();
	});
	expect(screen.getByText('@existing')).toBeInTheDocument();
	expect(screen.getByRole('alert')).toHaveTextContent('Отвязка недоступна');
});
const failures = [
	'validation-error',
	'unauthenticated',
	'refresh-required',
	'invalid-telegram-data',
	'outdated-telegram-data',
	'already-linked',
	'linked-to-another-user',
	'not-linked',
	'unlink-forbidden',
	'forbidden',
	'not-found',
	'identity-mismatch',
	'error',
] as const;
it.each(failures)('handles link %s without false success or raw codes', async (status) => {
	link.mockResolvedValue({ status });
	mount();
	await authenticate();
	expect(screen.getByText('Telegram не подключён')).toBeInTheDocument();
	expect(screen.getByRole('alert').textContent).not.toContain(`telegram.errors.${status}`);
	expect(
		screen.queryByText('Telegram-аккаунт успешно привязан к Вашему аккаунту!'),
	).not.toBeInTheDocument();
	if (status === 'unauthenticated') expect(replace).toHaveBeenCalled();
});
it.each(failures)('handles unlink %s without losing linked state', async (status) => {
	unlink.mockResolvedValue({ status });
	mount('existing');
	open();
	await confirm();
	expect(screen.getByText('@existing')).toBeInTheDocument();
	expect(screen.getByRole('alert')).toBeInTheDocument();
	expect(screen.queryByText('Telegram успешно отвязан от Вашего аккаунта')).not.toBeInTheDocument();
});
it('handles thrown Action errors and script failure safely', async () => {
	link.mockRejectedValue(new Error('private details'));
	mount();
	await authenticate();
	expect(screen.getByRole('alert')).not.toHaveTextContent('private details');
	const script = document.querySelector('script')!;
	act(() => {
		script.dispatchEvent(new Event('error'));
	});
	expect(screen.getByText('Не удалось загрузить Telegram. Попробуйте позже.')).toBeInTheDocument();
	expect(document.querySelector('script')).toBeNull();
});
it('ignores late mutation response after the whole shell unmounts', async () => {
	let resolve!: (value: TelegramMutationResult) => void;
	link.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	const view = mount();
	act(() => widgetCallback()(payload));
	view.unmount();
	await act(async () => {
		resolve({ status: 'success', telegramUsername: 'late' });
		await Promise.resolve();
	});
	expect(document.querySelector('script')).toBeNull();
	expect(screen.queryByText('@late')).not.toBeInTheDocument();
});

it('keeps email cooldown alongside Telegram link, with no refetch on tab navigation', async () => {
	jest.useFakeTimers();
	const view = mount(null, 'SyntheticBot', true);
	try {
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
			await Promise.resolve();
		});
		expect(screen.getByText('Письмо успешно отправлено на почту')).toBeInTheDocument();
		await authenticate();
		expect(screen.getByText('Telegram подтверждён')).toBeInTheDocument();
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		await act(async () => {
			await jest.advanceTimersByTimeAsync(30000);
		});
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		expect(screen.getByText('Письмо успешно отправлено на почту')).toBeInTheDocument();
		expect(screen.getByText('Telegram подтверждён')).toBeInTheDocument();
		expect(sendEmail).toHaveBeenCalledTimes(1);
		expect(link).toHaveBeenCalledTimes(1);
		expect(readEmail).not.toHaveBeenCalled();
		expect(unlink).not.toHaveBeenCalled();
		view.unmount();
		expect(jest.getTimerCount()).toBe(0);
	} finally {
		view.unmount();
		jest.useRealTimers();
	}
});
