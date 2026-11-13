import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { Dropdown } from '../Dropdown/Dropdown';
import { Option } from './Option';

it('preserves mouse selection and option semantics', () => {
	const onClick = jest.fn();
	render(<Option value={1} label="Skill" onClick={onClick} isSelected className="custom" />);
	const option = screen.getByRole('option');
	fireEvent.click(option);
	expect(onClick).toHaveBeenCalledTimes(1);
	expect(option).toHaveAttribute('aria-selected', 'true');
	expect(option).toHaveClass('custom');
	expect(option).toHaveAttribute('tabindex', '0');
});
it.each(['Enter', ' '])('activates exactly once on %j and prevents its default action', (key) => {
	const onClick = jest.fn();
	render(<Option value={1} label="Skill" onClick={onClick} />);
	const option = screen.getByRole('option');
	option.focus();
	expect(option).toHaveFocus();
	expect(fireEvent.keyDown(option, { key })).toBe(false);
	fireEvent.keyPress(option, { key });
	fireEvent.keyUp(option, { key });
	expect(onClick).toHaveBeenCalledTimes(1);
});
it.each([
	{ key: 'Tab' },
	{ key: 'Tab', shiftKey: true },
	{ key: 'ArrowUp' },
	{ key: 'ArrowDown' },
	{ key: 'Escape' },
	{ key: 'a' },
	{ key: 'Delete' },
	{ key: 'Backspace' },
])('does not select on $key, shift=$shiftKey', (event) => {
	const onClick = jest.fn();
	render(<Option value={1} label="Skill" onClick={onClick} />);
	expect(fireEvent.keyDown(screen.getByRole('option'), event)).toBe(true);
	expect(onClick).not.toHaveBeenCalled();
});
it.each(['Enter', ' '])('ignores auto-repeat for %j without allowing scrolling', (key) => {
	const onClick = jest.fn();
	render(<Option value={1} label="Skill" onClick={onClick} />);
	const option = screen.getByRole('option');
	fireEvent.keyDown(option, { key });
	expect(fireEvent.keyDown(option, { key, repeat: true })).toBe(false);
	expect(onClick).toHaveBeenCalledTimes(1);
});
it('keeps disabled options inactive and outside the normal tab order', () => {
	const onClick = jest.fn();
	render(<Option value={1} label="Skill" onClick={onClick} disabled />);
	const option = screen.getByRole('option');
	for (const key of ['Enter', ' ', 'Tab', 'ArrowDown']) fireEvent.keyDown(option, { key });
	fireEvent.click(option);
	expect(onClick).not.toHaveBeenCalled();
	expect(option).toHaveAttribute('aria-disabled', 'true');
	expect(option).toHaveAttribute('tabindex', '-1');
});
it('permits activation without a callback without throwing', () => {
	render(<Option value={1} label="Skill" />);
	expect(() => fireEvent.keyDown(screen.getByRole('option'), { key: 'Enter' })).not.toThrow();
});
it.each(['Enter', ' '])(
	'integrates with Dropdown: Tab does not select, %j selects once and closes',
	(key) => {
		const onSelect = jest.fn();
		render(
			<Dropdown label="Choose" onSelect={onSelect}>
				<Option value={7} label="Skill" />
			</Dropdown>,
		);
		fireEvent.keyDown(screen.getByTestId('dropdown-select'), { key: 'Enter' });
		const option = screen.getByRole('option');
		option.focus();
		fireEvent.keyDown(option, { key: 'Tab' });
		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		fireEvent.keyDown(option, { key });
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(7);
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	},
);
