import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import type { ProfileSkill } from '@/entities/profile';

import { ProfileSkills } from '../index';

jest.mock('@/shared/config', () => ({
	i18Namespace: { profile: 'profile' },
}));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/profile.json'),
		});
	},
}));
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
	globalThis.fetch = fetchMock;
	fetchMock.mockReset();
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
});
const skills: ProfileSkill[] = [
	{ id: 1, title: 'JavaScript', imageSrc: 'https://images.example/js.png' },
	{ id: 2, title: 'TypeScript', imageSrc: null },
];
it('renders multiple skills and the translated heading', () => {
	const { container } = render(<ProfileSkills skillsList={skills} />);
	expect(screen.getByRole('heading', { name: 'Навыки' })).toBeInTheDocument();
	expect(screen.getAllByRole('listitem')).toHaveLength(2);
	expect(screen.getByText('JavaScript')).toBeInTheDocument();
	expect(screen.getByText('TypeScript')).toBeInTheDocument();
	expect(container.querySelector('img')).toHaveAttribute('src', 'https://images.example/js.png');
	expect(container.querySelector('img')).toHaveAttribute('alt', '');
	expect(container.querySelector('a, button')).toBeNull();
});
it.each([undefined, null, []])('renders the empty state for %#', (skillsList) => {
	render(<ProfileSkills skillsList={skillsList} />);
	expect(screen.getByText('Не выбраны навыки')).toBeInTheDocument();
	expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
it('omits missing and unsafe icons without dropping the skill', () => {
	const { container } = render(
		<ProfileSkills
			skillsList={[
				{ id: 1, title: 'No icon', imageSrc: null },
				{ id: 2, title: 'Unsafe icon', imageSrc: 'javascript:alert(1)' },
				{ id: 3, title: 'Empty icon', imageSrc: '' },
			]}
		/>,
	);
	expect(container.querySelector('img')).toBeNull();
	expect(screen.getAllByRole('listitem')).toHaveLength(3);
});
it('preserves long titles and updates when props change', () => {
	const title = 'Skill'.repeat(100);
	const { rerender } = render(<ProfileSkills skillsList={[{ id: 1, title, imageSrc: null }]} />);
	expect(screen.getByText(title)).toBeInTheDocument();
	rerender(<ProfileSkills skillsList={[]} />);
	expect(screen.queryByText(title)).not.toBeInTheDocument();
	expect(screen.getByText('Не выбраны навыки')).toBeInTheDocument();
});
