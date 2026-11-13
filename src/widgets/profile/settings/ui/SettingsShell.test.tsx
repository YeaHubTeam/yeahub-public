import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import header from '../../../../../public/locales/ru/header.json';
import profile from '../../../../../public/locales/ru/profile.json';
import { SettingsShell } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => ({ replace: jest.fn() }),
}));

const ids = ['select-tariff', 'change-password', 'email-verify', 'account'];
const labels = ['Выбрать тариф', 'Смена пароля', 'Верификация', 'Аккаунт'];
const mount = () =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header }}>
			<SettingsShell />
		</NextIntlClientProvider>,
	);
const selected = (index: number) =>
	expect(screen.getByRole('tab', { name: labels[index] })).toHaveAttribute('aria-selected', 'true');

beforeEach(() => window.history.replaceState(null, '', '/ru/settings'));

test('renders localized tabs in React order and a neutral default panel', () => {
	mount();
	expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(labels);
	selected(0);
	expect(screen.getByRole('tabpanel')).toBeEmptyDOMElement();
	expect(screen.queryByRole('heading')).not.toBeInTheDocument();
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test.each(ids)('opens the direct hash %s', (id) => {
	window.history.replaceState(null, '', `/ru/settings#${id}`);
	mount();
	selected(ids.indexOf(id));
});

test('replaces hash, preserves locale/query/state, and unmounts the old panel', () => {
	window.history.replaceState({ marker: true }, '', '/ru/settings?test=1');
	mount();
	const oldPanel = screen.getByRole('tabpanel');
	const length = window.history.length;
	fireEvent.click(screen.getByRole('tab', { name: labels[2] }));
	selected(2);
	expect(window.location.pathname + window.location.search + window.location.hash).toBe(
		'/ru/settings?test=1#email-verify',
	);
	expect(window.history.state).toEqual({ marker: true });
	expect(window.history.length).toBe(length);
	expect(oldPanel).not.toBeInTheDocument();
	expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
});

test('synchronizes actual Back and Forward traversal', async () => {
	window.history.replaceState(null, '', '/ru/settings#select-tariff');
	window.history.pushState(null, '', '/ru/settings#account');
	mount();
	selected(3);
	act(() => {
		window.history.back();
	});
	await waitFor(() => selected(0));
	act(() => {
		window.history.forward();
	});
	await waitFor(() => selected(3));
});

test('unknown hashes select tariffs without rewriting the URL', () => {
	window.history.replaceState(null, '', '/ru/settings#unknown');
	mount();
	selected(0);
	expect(window.location.hash).toBe('#unknown');
	fireEvent.click(screen.getByRole('tab', { name: labels[1] }));
	act(() => {
		window.history.replaceState(null, '', '/ru/settings#other');
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	});
	selected(0);
	expect(window.location.hash).toBe('#other');
});

test('supports keyboard tab selection and focus', () => {
	mount();
	const first = screen.getByRole('tab', { name: labels[0] });
	first.focus();
	fireEvent.keyDown(first, { key: 'ArrowRight' });
	selected(1);
	expect(screen.getByRole('tab', { name: labels[1] })).toHaveFocus();
	fireEvent.keyDown(document.activeElement!, { key: 'End' });
	selected(3);
	fireEvent.keyDown(document.activeElement!, { key: 'Home' });
	selected(0);
});

test('does not request business data and cleans up navigation listeners', () => {
	const fetchMock = jest.fn();
	const originalFetch = global.fetch;
	global.fetch = fetchMock;
	const remove = jest.spyOn(window, 'removeEventListener');
	const { unmount } = mount();
	ids.forEach((_, index) => fireEvent.click(screen.getByRole('tab', { name: labels[index] })));
	expect(fetchMock).not.toHaveBeenCalled();
	unmount();
	expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
	expect(remove).toHaveBeenCalledWith('popstate', expect.any(Function));
	global.fetch = originalFetch;
	remove.mockRestore();
});
