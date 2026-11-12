import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { UserDropdown } from './UserDropdown';

const push = jest.fn();
const replace = jest.fn();
const signOut = jest.fn();
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { header: 'header', translation: 'translation' },
	ROUTES: { profile: { page: '/profile' }, auth: { login: { page: '/auth/login' } } },
	useRouter: () => ({ push, replace }),
}));
jest.mock('@/shared/libs', () => ({ useScreenSize: () => ({ isMobile: false, isTablet: false }) }));
jest.mock('next-auth/react', () => ({ signOut: (...args: unknown[]) => signOut(...args) }));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
beforeEach(() => {
	push.mockReset();
	replace.mockReset();
	signOut.mockReset();
});
it('opens the existing menu, goes to local profile and closes the Popover', async () => {
	render(<UserDropdown username="Name" image={null} />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	fireEvent.click(await screen.findByRole('button', { name: 'Мой профиль' }));
	expect(push).toHaveBeenCalledWith('/profile');
	await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	expect(signOut).not.toHaveBeenCalled();
});
it('keeps unimplemented membership/settings disabled and preserves logout', async () => {
	signOut.mockResolvedValue({ url: '/auth/login' });
	render(<UserDropdown username="Name" />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	expect(await screen.findByRole('button', { name: 'Выбрать членство' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Настройки' })).toBeDisabled();
	fireEvent.click(screen.getByRole('button', { name: 'Выйти' }));
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/login'));
	expect(signOut).toHaveBeenCalledWith({ redirect: false });
	expect(push).not.toHaveBeenCalled();
});
