/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Popover } from './Popover';

// These optional rendering branches are not exercised; Floating UI and focus management stay real.
jest.mock('@/shared/ui/Button', () => ({ Button: () => null }));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
jest.mock('../PopoverMenu/PopoverMenu', () => ({ PopoverMenu: () => null }));

afterEach(cleanup);

const renderPopover = (ariaLabel?: string, onClickOutside?: () => void) => {
	const user = userEvent.setup();
	render(
		<>
			<Popover
				ariaLabel={ariaLabel}
				onClickOutside={onClickOutside}
				body={<button type="button">Action</button>}
			>
				{({ onToggle }) => (
					<button type="button" onClick={onToggle}>
						Open
					</button>
				)}
			</Popover>
			<button type="button">Outside</button>
		</>,
	);
	return { user, trigger: screen.getByRole('button', { name: 'Open' }) };
};

describe('Popover accessible name and existing interactions', () => {
	it('names the dialog and preserves trigger accessibility attributes', async () => {
		const { user, trigger } = renderPopover('User menu');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		await user.click(trigger);
		const dialog = await screen.findByRole('dialog', { name: 'User menu' });
		expect(dialog).toHaveAttribute('aria-label', 'User menu');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(trigger).toHaveAttribute('aria-controls', dialog.id);
		await user.click(trigger);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});
	it('leaves aria-label absent when it was not supplied', async () => {
		const { user, trigger } = renderPopover();
		await user.click(trigger);
		expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-label');
	});
	it('supports keyboard opening, Escape dismissal and returning focus', async () => {
		const { user, trigger } = renderPopover('User menu');
		trigger.focus();
		await user.keyboard('{Enter}');
		expect(await screen.findByRole('dialog', { name: 'User menu' })).toBeInTheDocument();
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		await waitFor(() => expect(trigger).toHaveFocus());
	});
	it('preserves outside-click dismissal and its callback', async () => {
		const onClickOutside = jest.fn();
		const { user, trigger } = renderPopover('User menu', onClickOutside);
		await user.click(trigger);
		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Outside' }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(onClickOutside).toHaveBeenCalledTimes(1);
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});
});
