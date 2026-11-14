import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import profile from '../../../../../public/locales/ru/profile.json';
import { AccountProfiles } from './AccountProfiles';
import type { AccountProfilesData } from './AccountProfiles';

jest.mock('@/shared/assets/images/multyProfile.png', () => ({
	src: '/multyProfile.png',
	width: 96,
	height: 96,
}));
const mount = (data: AccountProfilesData) =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile }}>
			<AccountProfiles {...data} />
		</NextIntlClientProvider>,
	);
const profiles: AccountProfilesData['profiles'] = [
	{ id: 'second', specializationId: 2, isActive: false, specializationTitle: 'Backend' },
	{ id: 'first', specializationId: 1, isActive: true, specializationTitle: 'Frontend' },
	{ id: 'empty', specializationId: 0, isActive: false, specializationTitle: null },
];
it('renders the exact banner without its own heading and uses the original illustration', () => {
	mount({ hasPremiumAccess: false, profiles: [] });
	expect(
		screen.getByText(profile.manage.profiles.multiprofile.banner.description),
	).toBeInTheDocument();
	expect(screen.getByRole('img', { name: 'MultyProfile' })).toHaveAttribute(
		'src',
		expect.stringContaining('multyProfile.png'),
	);
	expect(screen.getAllByRole('heading')).toHaveLength(1);
	expect(screen.getByRole('heading', { name: 'Ваши профили' })).toBeInTheDocument();
	expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	expect(screen.getByText('0/3')).toBeInTheDocument();
});
it.each([false, true])('shows all profiles in server order with premium=%s', (hasPremiumAccess) => {
	mount({ hasPremiumAccess, profiles });
	const cards = screen.getAllByRole('listitem');
	expect(cards.map((card) => card.querySelector('p')?.textContent)).toEqual([
		'Backend',
		'Frontend',
		'Специальность ещё не выбрана',
	]);
	expect(within(cards[1]).getByText('Активный профиль')).toBeInTheDocument();
	expect(cards[1]).toHaveClass('active');
	expect(cards[0]).not.toHaveClass('active');
	expect(screen.getByText(hasPremiumAccess ? '3/10' : '3/3')).toBeInTheDocument();
	expect(screen.getAllByRole('button')).toHaveLength(1);
	expect(screen.getByRole('button', { name: 'Как сменить специализацию' })).toBeInTheDocument();
	expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
it('renders one profile and isolates a missing specialization title', () => {
	mount({ hasPremiumAccess: false, profiles: [{ ...profiles[0], specializationTitle: null }] });
	expect(screen.getByText('Не удалось загрузить специальность')).toBeInTheDocument();
	expect(screen.getByText('1/3')).toBeInTheDocument();
});
it('does not hide an exceeded limit or mutate profile data', () => {
	const data = Array.from({ length: 4 }, (_, index) => ({ ...profiles[0], id: String(index) }));
	const original = JSON.stringify(data);
	mount({ hasPremiumAccess: false, profiles: data });
	expect(screen.getByText('4/3')).toBeInTheDocument();
	expect(JSON.stringify(data)).toBe(original);
});
it('has no direct HTTP requests or app-layer imports', () => {
	const source = readFileSync(
		join(process.cwd(), 'src/widgets/profile/settings/ui/AccountProfiles.tsx'),
		'utf8',
	);
	expect(source).not.toMatch(/fetch\(|from ['"][^'"]*app\//);
	const css = readFileSync(
		join(process.cwd(), 'src/widgets/profile/settings/ui/AccountProfiles.module.css'),
		'utf8',
	);
	expect(css).toContain('@media (width < 768px)');
	expect(css).toContain('padding: 10px;');
});

const steps = [
	'Нажмите «Добавить +»',
	'Перейдите в созданный профиль',
	'Выберите специальность для этого профиля',
	'Прогресс будет новым, то есть направления подготовки будут разделены',
];
it('opens the accessible help dialog using the keyboard with the exact four ordered steps', async () => {
	const user = userEvent.setup();
	mount({ hasPremiumAccess: false, profiles: [] });
	const help = screen.getByRole('button', { name: 'Как сменить специализацию' });
	help.focus();
	await user.keyboard('{Enter}');
	const dialog = screen.getByRole('dialog', { name: 'Как выбрать новую специальность' });
	expect(
		within(dialog)
			.getAllByRole('listitem')
			.map((item) => item.textContent),
	).toEqual(steps);
	expect(
		within(dialog).getByText(
			'💡  Таким образом, вы можете удобно вести несколько направлений обучения — для каждой специальности свой профиль и свой прогресс.',
			{ normalizer: (value) => value },
		),
	).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Закрыть модальное окно' })).toHaveFocus();
	await user.keyboard('{Escape}');
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(help).toHaveFocus();
	await user.keyboard(' ');
	expect(screen.getByRole('dialog')).toBeInTheDocument();
	await user.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
	expect(help).toHaveFocus();
});
it('supports backdrop close, inside clicks, and repeat opening', () => {
	mount({ hasPremiumAccess: false, profiles: [] });
	const help = screen.getByRole('button', { name: 'Как сменить специализацию' });
	fireEvent.click(help);
	fireEvent.click(screen.getByText(steps[0]));
	expect(screen.getByRole('dialog')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('presentation'));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	fireEvent.click(help);
	expect(within(screen.getByRole('dialog')).getAllByRole('listitem')).toHaveLength(4);
});

it('keeps the React deletion warning, label and placeholder verbatim', () => {
	expect(profile.manage.profiles.modal.delete.profile).toEqual({
		title: 'Удаление профиля',
		description:
			'Все ваши данные, прогресс и активность будут\nбезвозвратно удалены. Это действие невозможно отменить.',
		label: 'Введите ваш никнейм для подтверждения',
		placeholder: 'Введите ваш никнейм',
		button: 'Удалить профиль',
	});
});
