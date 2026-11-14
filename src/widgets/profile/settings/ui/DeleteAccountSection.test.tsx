import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import user from '../../../../../public/locales/ru/user.json';
import { DeleteAccountSection } from './DeleteAccountSection';
import type { AccountDeletionController } from './DeleteAccountSection';

const controller = (
	changes: Partial<AccountDeletionController> = {},
): AccountDeletionController => ({
	open: false,
	confirmation: '',
	phase: 'idle',
	message: null,
	disabled: false,
	openDialog: jest.fn(),
	closeDialog: jest.fn(),
	setConfirmation: jest.fn(),
	confirm: jest.fn(),
	retrySignOut: jest.fn(),
	...changes,
});
const mount = (c = controller(), username: string | null = ' Name ') =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ user }}>
			<DeleteAccountSection username={username} controller={c} />
		</NextIntlClientProvider>,
	);
it('uses the exact React section and confirmation texts without subscription conditions', () => {
	const c = controller({ open: true });
	mount(c);
	expect(screen.getByRole('heading', { name: 'Удаление аккаунта' })).toBeInTheDocument();
	expect(
		screen.getByText(
			'Все ваши данные, прогресс и активность будут безвозвратно удалены. Это действие невозможно отменить.',
		),
	).toBeInTheDocument();
	expect(
		screen.getByText(
			'Вы уверены? Это действие нельзя отменить. Будет удален весь прогресс, профили и данные аккаунта.',
		),
	).toBeInTheDocument();
	expect(screen.getByPlaceholderText('Введите ваш никнейм')).toHaveAccessibleName(
		'Введите ваш никнейм для подтверждения',
	);
	expect(screen.queryByText(/подписк/)).not.toBeInTheDocument();
});
it.each([null, ''])('disables confirmation without username %j', (username) => {
	const c = controller({ open: true, confirmation: ' Name ' });
	mount(c, username);
	expect(
		within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить аккаунт' }),
	).toBeDisabled();
});
it('does not close a pending modal or allow repeated confirmation', () => {
	const c = controller({
		open: true,
		phase: 'deleting',
		disabled: true,
		confirmation: ' Name ',
		message: 'pending',
	});
	mount(c);
	expect(screen.getByRole('button', { name: 'Отменить' })).toBeDisabled();
	expect(
		within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить аккаунт' }),
	).toBeDisabled();
	expect(screen.queryByRole('button', { name: 'Закрыть модальное окно' })).not.toBeInTheDocument();
});
it('shows only retry sign-out instead of deletion confirmation after sign-out failure', () => {
	const c = controller({ phase: 'signout-error', message: 'signout-error', disabled: true });
	mount(c);
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Удалить аккаунт' })).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Повторить выход' }));
	expect(c.retrySignOut).toHaveBeenCalledTimes(1);
	expect(c.confirm).not.toHaveBeenCalled();
});
it('keeps React breakpoints and confines this component to presentation', () => {
	const source = readFileSync(
		join(process.cwd(), 'src/widgets/profile/settings/ui/DeleteAccountSection.tsx'),
		'utf8',
	);
	expect(source).not.toMatch(/fetch\(|signOut\(|deleteSettingsAccount\(/);
	const css = readFileSync(
		join(process.cwd(), 'src/widgets/profile/settings/ui/DeleteAccountSection.module.css'),
		'utf8',
	);
	expect(css).toContain('@media (width < 768px)');
	expect(css).toContain('@media (width < 480px)');
});
