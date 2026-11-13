import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { EditSkills, getInitialSkillIds } from '../index';
import type { EditSkillsProps } from '../index';

jest.mock('@/shared/config', () => ({ i18Namespace: { profile: 'profile' } }));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/profile.json'),
		});
	},
}));
const initialSkills = [{ id: 999, title: 'Outside catalogue', imageSrc: '/skill.png' }];
const options = [
	{ id: 2, title: 'React' },
	{ id: 1, title: 'TypeScript' },
];
const Harness = ({
	visible = true,
	...props
}: Partial<EditSkillsProps> & { visible?: boolean }) => {
	const methods = useForm({
		defaultValues: {
			profileSkills: getInitialSkillIds(props.initialSkills ?? initialSkills),
			description: 'Other tab draft',
		},
	});
	const values = useWatch({ control: methods.control });
	return (
		<FormProvider {...methods}>
			{visible && <EditSkills initialSkills={initialSkills} options={options} {...props} />}
			<button
				type="button"
				onClick={() => methods.setError('profileSkills', { message: 'Ошибка навыков' })}
			>
				Field error
			</button>
			<output data-testid="draft">{JSON.stringify(values)}</output>
		</FormProvider>
	);
};
const draft = () =>
	JSON.parse(screen.getByTestId('draft').textContent) as {
		profileSkills: number[];
		description: string;
	};
const open = () => fireEvent.click(screen.getByTestId('dropdown-select'));
const chip = (title = 'Outside catalogue') =>
	screen.getByRole('button', {
		name: title === 'Outside catalogue' ? 'Outside catalogue Outside catalogue' : title,
	});
it('renders original translated headings, full initial IDs and metadata outside the catalogue', () => {
	const { container } = render(<Harness />);
	expect(screen.getByText('Твои навыки')).toBeInTheDocument();
	expect(
		screen.getByText('Покажи, что ты умеешь и в чём ты действительно хорош'),
	).toBeInTheDocument();
	expect(chip()).toBeInTheDocument();
	expect(screen.getByAltText('Outside catalogue')).toBeInTheDocument();
	expect(draft()).toEqual({ profileSkills: [999], description: 'Other tab draft' });
	expect(container.querySelector('form')).toBeNull();
	expect(screen.queryByRole('textbox')).toBeNull();
	expect(screen.getByRole('group', { name: 'Навыки' })).toHaveClass('control');
});
it('opening and closing never filters initial IDs', () => {
	render(<Harness />);
	open();
	expect(screen.getAllByRole('option')).toHaveLength(2);
	open();
	expect(screen.queryByRole('listbox')).toBeNull();
	expect(draft().profileSkills).toEqual([999]);
});
it.each(['mouse', 'Enter', ' '])('adds an option by %s without losing existing IDs', (key) => {
	render(<Harness />);
	open();
	const option = screen.getByRole('option', { name: 'React' });
	if (key === 'mouse') fireEvent.click(option);
	else fireEvent.keyDown(option, { key });
	expect(draft().profileSkills).toEqual([999, 2]);
	open();
	expect(screen.queryByRole('option', { name: 'React' })).toBeNull();
});
it.each(['Tab', 'ArrowUp', 'ArrowDown', 'Escape', 'a'])('does not select on %s', (key) => {
	render(<Harness />);
	open();
	fireEvent.keyDown(screen.getByRole('option', { name: 'React' }), { key });
	expect(draft().profileSkills).toEqual([999]);
});
it.each(['Delete', 'Backspace', 'mouse'])(
	'deletes explicitly by %s and permits reselection without duplicates',
	(key) => {
		render(<Harness initialSkills={[...initialSkills, options[0]]} />);
		const target = chip('React');
		if (key === 'mouse') fireEvent.click(target.querySelector('svg')!);
		else fireEvent.keyDown(target, { key });
		expect(draft().profileSkills).toEqual([999]);
		open();
		fireEvent.click(screen.getByRole('option', { name: 'React' }));
		expect(draft().profileSkills).toEqual([999, 2]);
	},
);
it('preserves IDs and cached titles when options change', () => {
	const view = render(<Harness />);
	open();
	fireEvent.click(screen.getByRole('option', { name: 'React' }));
	view.rerender(<Harness options={[]} />);
	expect(chip('React')).toBeInTheDocument();
	expect(draft().profileSkills).toEqual([999, 2]);
	expect(screen.getByText('Нет доступных опций')).toBeInTheDocument();
});
it('preserves the shared draft between tabs and never resets it from new metadata', () => {
	const view = render(<Harness />);
	open();
	fireEvent.click(screen.getByRole('option', { name: 'React' }));
	view.rerender(<Harness visible={false} />);
	expect(draft().profileSkills).toEqual([999, 2]);
	view.rerender(<Harness initialSkills={[{ id: 999, title: 'Updated title' }]} />);
	expect(chip('Updated title')).toBeInTheDocument();
	expect(draft()).toEqual({ profileSkills: [999, 2], description: 'Other tab draft' });
});
it('supports an empty selected list and no options', () => {
	render(<Harness initialSkills={[]} options={[]} />);
	expect(draft().profileSkills).toEqual([]);
	expect(screen.queryByTestId('chip')).toBeNull();
	expect(screen.getByText('Нет доступных опций')).toBeInTheDocument();
});
it('shows loading without changing IDs', () => {
	render(<Harness loading />);
	expect(screen.getByRole('status', { name: 'Загружаем навыки…' })).toBeInTheDocument();
	expect(screen.queryByTestId('dropdown-select')).toBeNull();
	expect(draft().profileSkills).toEqual([999]);
});
it.each([{ error: true }, { disabled: true }])(
	'blocks selection and even delete-icon clicks when unavailable: %j',
	(props) => {
		render(<Harness {...props} />);
		open();
		expect(screen.queryByRole('listbox')).toBeNull();
		fireEvent.click(screen.getByTestId('chip').querySelector('svg')!);
		expect(draft().profileSkills).toEqual([999]);
		if (props.error)
			expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить навыки');
	},
);
it('renders RHF errors accessibly', () => {
	render(<Harness />);
	fireEvent.click(screen.getByText('Field error'));
	expect(screen.getByRole('alert')).toHaveTextContent('Ошибка навыков');
});

it('keeps a selected profile skill outside the first 100 options through selection', () => {
	const catalogue = Array.from({ length: 100 }, (_, index) => ({
		id: index + 1,
		title: `Skill ${index + 1}`,
	}));
	render(<Harness options={catalogue} />);
	open();
	expect(screen.getAllByRole('option')).toHaveLength(100);
	fireEvent.click(screen.getByRole('option', { name: 'Skill 100' }));
	expect(draft().profileSkills).toEqual([999, 100]);
	expect(chip()).toBeInTheDocument();
});
