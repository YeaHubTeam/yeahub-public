/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({ useTranslations: () => () => 'Войти' }));
jest.mock('@/shared/config', () => ({
	AUTH_LINKS: { login: '/ru/auth/login' },
	Header: { AUTH_SIGN_IN: 'login' },
	i18Namespace: { header: 'header' },
}));
const { HeaderAuthDesktop } = jest.requireActual<
	typeof import('../../../widgets/Header/ui/HeaderAuth/HeaderAuthDesktop/HeaderAuthDesktop')
>('../../../widgets/Header/ui/HeaderAuth/HeaderAuthDesktop/HeaderAuthDesktop');
it('header использует primary large, без конфликтующего link variant', () => {
	render(<HeaderAuthDesktop />);
	const link = screen.getByRole('link', { name: 'Войти' });
	expect(link.getAttribute('href')).toBe('/ru/auth/login');
	expect(link.className).toContain('button-primary');
	expect(link.className).toContain('button-large');
	expect(link.className).not.toContain('a-link');
});
