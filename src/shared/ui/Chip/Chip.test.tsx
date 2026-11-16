import { useState } from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { SelectWithChips } from '@/shared/ui/SelectWithChips';

import { Chip } from './Chip';

it('keeps the existing mouse click and delete-icon behavior', () => {
	const onClick = jest.fn();
	const onDelete = jest.fn();
	const { container } = render(<Chip label="Skill" onClick={onClick} onDelete={onDelete} />);
	fireEvent.click(screen.getByRole('button'));
	expect(onClick).toHaveBeenCalledTimes(1);
	expect(onDelete).not.toHaveBeenCalled();
	fireEvent.click(container.querySelector('svg')!);
	expect(onDelete).toHaveBeenCalledTimes(1);
	// Preserve the existing mouse event bubbling to the chip onClick.
	expect(onClick).toHaveBeenCalledTimes(2);
});
it.each(['Delete', 'Backspace'])(
	'deletes the focused chip once with %s without calling onClick',
	(key) => {
		const onClick = jest.fn();
		const onDelete = jest.fn();
		const parent = jest.fn();
		render(
			<div onKeyDown={parent}>
				<Chip label="Skill" onClick={onClick} onDelete={onDelete} />
			</div>,
		);
		const chip = screen.getByRole('button');
		chip.focus();
		expect(chip).toHaveFocus();
		expect(fireEvent.keyDown(chip, { key })).toBe(false);
		fireEvent.keyUp(chip, { key });
		fireEvent.keyDown(chip, { key, repeat: true });
		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(onClick).not.toHaveBeenCalled();
		expect(parent).not.toHaveBeenCalled();
	},
);
it.each(['Delete', 'Backspace'])('does nothing for %s when onDelete is absent', (key) => {
	const onClick = jest.fn();
	render(<Chip label="Skill" onClick={onClick} />);
	expect(fireEvent.keyDown(screen.getByRole('button'), { key })).toBe(true);
	expect(onClick).not.toHaveBeenCalled();
});
it.each(['Enter', ' '])('preserves independent onClick activation with %j', (key) => {
	const onClick = jest.fn();
	const onDelete = jest.fn();
	render(<Chip label="Skill" onClick={onClick} onDelete={onDelete} />);
	const chip = screen.getByRole('button');
	expect(fireEvent.keyDown(chip, { key })).toBe(false);
	fireEvent.keyUp(chip, { key });
	expect(onClick).toHaveBeenCalledTimes(1);
	expect(onDelete).not.toHaveBeenCalled();
});
it.each(['Enter', ' ', 'Tab', 'ArrowUp', 'ArrowDown', 'Escape', 'a'])(
	'never treats %j as deletion',
	(key) => {
		const onDelete = jest.fn();
		render(<Chip label="Skill" onDelete={onDelete} />);
		fireEvent.keyDown(screen.getByRole('button'), { key });
		expect(onDelete).not.toHaveBeenCalled();
	},
);
it('does not treat a nested input Backspace as chip deletion', () => {
	const onDelete = jest.fn();
	render(<Chip label="Skill" onDelete={onDelete} prefix={<input aria-label="Nested input" />} />);
	const input = screen.getByLabelText('Nested input');
	input.focus();
	expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true);
	expect(onDelete).not.toHaveBeenCalled();
});
it('does not activate a disabled chip with the keyboard', () => {
	const onClick = jest.fn();
	const onDelete = jest.fn();
	const { container } = render(
		<Chip label="Skill" disabled onClick={onClick} onDelete={onDelete} />,
	);
	const chip = container.querySelector('[role="button"]')!;
	for (const key of ['Delete', 'Backspace', 'Enter', ' ']) fireEvent.keyDown(chip, { key });
	expect(onClick).not.toHaveBeenCalled();
	expect(onDelete).not.toHaveBeenCalled();
});
it('keeps passive chips unchanged and focusable', () => {
	render(<Chip label="Passive" disablePointer />);
	const chip = screen.getByRole('button');
	expect(chip).toHaveAttribute('tabindex', '0');
	chip.focus();
	expect(chip).toHaveFocus();
	expect(() => fireEvent.keyDown(chip, { key: 'Delete' })).not.toThrow();
});
const Fixture = () => {
	const [selected, setSelected] = useState([999]);
	return (
		<>
			<SelectWithChips
				title="Selected"
				options={[{ label: 'New skill', value: '1' }]}
				selectedItems={selected}
				itemsDictionary={{
					999: { id: 999, title: 'Existing skill' },
					1: { id: 1, title: 'New skill' },
				}}
				onChange={(value) => {
					if (value) setSelected((ids) => [...ids, Number(value)]);
				}}
				handleDeleteItem={(id) => () => setSelected((ids) => ids.filter((value) => value !== id))}
			/>
			<output data-testid="selected">{JSON.stringify(selected)}</output>
		</>
	);
};
it('works with the real SelectWithChips without changing other selected IDs', () => {
	render(<Fixture />);
	fireEvent.keyDown(screen.getByTestId('dropdown-select'), { key: 'Enter' });
	const option = screen.getByRole('option');
	fireEvent.keyDown(option, { key: 'Tab' });
	expect(screen.getByTestId('selected')).toHaveTextContent('[999]');
	fireEvent.keyDown(option, { key: 'Enter' });
	expect(screen.getByTestId('selected')).toHaveTextContent('[999,1]');
	const chips = screen.getAllByTestId('chip');
	chips[1].focus();
	fireEvent.keyDown(chips[1], { key: 'Delete' });
	expect(screen.getByTestId('selected')).toHaveTextContent('[999]');
	expect(screen.getByText('Existing skill')).toBeInTheDocument();
});
