import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { EmailSendModal } from './EmailSendModal';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth' },
}));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/auth.json'),
		});
	},
}));
jest.mock('@/shared/ui/Icon', () => ({
	Icon: ({
		dataTestId,
		icon: _icon,
		color: _color,
		type: _type,
		...props
	}: {
		dataTestId: string;
		icon: string;
		color: string;
		type: string;
	}) => <span {...props} data-testid={dataTestId} />,
}));
const close = jest.fn();
const resend = jest.fn<Promise<boolean>, []>();
const props = { isOpen: true, onClose: close, onResend: resend };
const button = () => screen.getByRole('button', { name: 'Отправить повторно' });
const tick = (ms: number) =>
	act(() => {
		jest.advanceTimersByTime(ms);
	});
const tryClose = () => {
	fireEvent.keyDown(screen.getByTestId('Modal_Overlay'), { key: 'Escape' });
	fireEvent.click(screen.getByTestId('Modal_Overlay'));
	fireEvent.click(screen.getByTestId('Modal_Close_Icon'));
};
beforeEach(() => {
	jest.useFakeTimers();
	jest.setSystemTime(1_800_000_000_000);
	close.mockReset();
	resend.mockReset();
});
afterEach(() => {
	jest.useRealTimers();
});
it('renders nothing while closed', () => {
	render(<EmailSendModal {...props} isOpen={false} />);
	expect(screen.queryByTestId('Modal')).toBeNull();
	expect(jest.getTimerCount()).toBe(0);
});
it('counts 60, 59, 1 and 0 and unlocks resend', () => {
	render(<EmailSendModal {...props} />);
	expect(screen.getByRole('timer')).toHaveTextContent('60 секунд');
	expect(button()).toBeDisabled();
	tick(1000);
	expect(screen.getByRole('timer')).toHaveTextContent('59 секунд');
	tick(58000);
	expect(screen.getByRole('timer')).toHaveTextContent('1 секунду');
	expect(button()).toBeDisabled();
	tick(1000);
	expect(screen.getByRole('timer')).toHaveTextContent('0 секунд');
	expect(button()).toBeEnabled();
});
it('blocks every close mechanism during countdown and allows them afterwards', () => {
	render(<EmailSendModal {...props} />);
	tryClose();
	expect(close).not.toHaveBeenCalled();
	tick(60000);
	tryClose();
	expect(close).toHaveBeenCalledTimes(3);
});
it('restarts countdown only after confirmed success', async () => {
	resend.mockResolvedValue(true);
	render(<EmailSendModal {...props} />);
	tick(60000);
	await act(async () => {
		fireEvent.click(button());
		await Promise.resolve();
	});
	expect(resend).toHaveBeenCalledTimes(1);
	expect(button()).toBeDisabled();
	expect(screen.getByRole('timer')).toHaveTextContent('60 секунд');
});
it.each([false, 'reject'])('shows safe error for unsuccessful resend: %s', async (outcome) => {
	if (outcome === 'reject') resend.mockRejectedValue(new Error('private-data'));
	else resend.mockResolvedValue(false);
	render(<EmailSendModal {...props} />);
	tick(60000);
	await act(async () => {
		fireEvent.click(button());
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toHaveTextContent(
		'Не удалось отправить письмо. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private-data')).toBeNull();
	expect(button()).toBeEnabled();
	expect(screen.getByRole('timer')).toHaveTextContent('0 секунд');
});
it('blocks duplicate resend and closing while callback is pending', async () => {
	let finish: ((value: boolean) => void) | undefined;
	resend.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	render(<EmailSendModal {...props} />);
	tick(60000);
	fireEvent.click(button());
	fireEvent.click(button());
	tryClose();
	expect(resend).toHaveBeenCalledTimes(1);
	expect(close).not.toHaveBeenCalled();
	expect(button()).toHaveAttribute('aria-busy', 'true');
	await act(async () => {
		finish?.(true);
		await Promise.resolve();
	});
});
it('cleans timers on close and resets on reopening', () => {
	const ui = render(<EmailSendModal {...props} />);
	tick(1000);
	ui.rerender(<EmailSendModal {...props} isOpen={false} />);
	expect(jest.getTimerCount()).toBe(0);
	ui.rerender(<EmailSendModal {...props} />);
	expect(screen.getByRole('timer')).toHaveTextContent('60 секунд');
	ui.unmount();
	expect(jest.getTimerCount()).toBe(0);
});
it('preserves translation newlines as plain safe text', () => {
	render(<EmailSendModal {...props} />);
	expect(screen.getByTestId('Modal_Title').textContent).toContain('\n');
	expect(screen.getByText(/Если.*вы.*не.*получили/).textContent).toContain('\n');
	expect(document.querySelector('p div, p p')).toBeNull();
});
