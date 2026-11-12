import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { ExpandableContent } from './ExpandableContent';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/translation.json'),
		});
	},
}));
afterEach(() => jest.restoreAllMocks());
it('does not add an action for short content', () => {
	jest
		.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
		.mockReturnValue({ height: 100 } as DOMRect);
	render(<ExpandableContent>Short</ExpandableContent>);
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('expands and collapses long content and updates after resize', () => {
	const measure = jest
		.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
		.mockReturnValue({ height: 400 } as DOMRect);
	const { unmount } = render(<ExpandableContent>Long</ExpandableContent>);
	const button = screen.getByRole('button');
	expect(button).toHaveAttribute('aria-expanded', 'false');
	expect(document.getElementById(button.getAttribute('aria-controls')!)).toHaveClass('collapsed');
	fireEvent.click(button);
	expect(button).toHaveAttribute('aria-expanded', 'true');
	fireEvent.click(button);
	expect(button).toHaveAttribute('aria-expanded', 'false');
	measure.mockReturnValue({ height: 100 } as DOMRect);
	fireEvent(window, new Event('resize'));
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
	const cleanup = jest.spyOn(window, 'removeEventListener');
	unmount();
	expect(cleanup).toHaveBeenCalledWith('resize', expect.any(Function));
});
