import type { ComponentProps, ReactElement, ReactNode } from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import type { OwnProfile } from '@/entities/profile';

import {
	EditPersonal,
	PERSONAL_SOCIAL_CODES,
	createPersonalDefaults,
	toPersonalPayload,
} from '../index';
import type { PersonalFormValues } from '../index';

jest.mock('@/shared/config', () => ({
	Link: jest.requireActual('@/shared/config').Link,
	ROUTES: { settings: { page: '/settings' } },
	i18Namespace: { profile: 'profile', translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	...jest.requireActual('next-intl'),
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
const push = jest.fn();
// Keep the real next-intl Link/localization; replace only Next's browser navigation boundary.
jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ href, onClick, ...props }: ComponentProps<'a'>) => (
		<a
			{...props}
			href={href}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) {
					event.preventDefault();
					push(href, {});
				}
			}}
		/>
	),
}));

jest.mock('next/navigation', () => ({
	usePathname: () => '/ru/profile/edit',
	useRouter: () => ({ push, replace: jest.fn(), prefetch: jest.fn() }),
}));
const render = (ui: ReactElement) =>
	rtlRender(ui, {
		wrapper: ({ children }) => (
			<NextIntlClientProvider locale="ru" messages={{}}>
				{children}
			</NextIntlClientProvider>
		),
	});
const profile: OwnProfile = {
	id: 'user',
	username: ' Name ',
	city: 'City',
	email: 'test@example.invalid',
	avatarUrl: null,
	birthday: null,
	country: null,
	isVerified: true,
	userRoles: [],
	activeProfile: {
		id: 'active',
		specializationId: 987654,
		description: 'Other tab',
		profileSkills: [],
		socialNetwork: [
			{ code: 'github', title: 'old github' },
			{ code: 'legacy', title: 'server only' },
			{ code: 'github', title: 'duplicate ignored' },
		],
	},
};
const Harness = ({
	visible = true,
	avatar = <div data-testid="avatar-slot">Avatar</div>,
	data = profile,
	specialization = { id: 987654, title: 'Frontend' },
	options = [] as { id: number; title: string }[],
	optionsError = false,
}: {
	visible?: boolean;
	avatar?: ReactNode;
	data?: OwnProfile;
	specialization?: { id: number; title: string } | null;
	options?: { id: number; title: string }[];
	optionsError?: boolean;
}) => {
	const methods = useForm<PersonalFormValues & { description: string }>({
		defaultValues: { ...createPersonalDefaults(data), description: 'Other tab draft' },
		mode: 'onTouched',
	});
	const values = useWatch({ control: methods.control });
	return (
		<FormProvider {...methods}>
			{visible && (
				<EditPersonal
					profile={data}
					specialization={specialization}
					avatar={avatar}
					specializationOptions={options}
					specializationError={optionsError}
				/>
			)}
			<button
				type="button"
				onClick={() => methods.setError('username', { message: 'Минимальная длина 2 символа' })}
			>
				Set field error
			</button>
			<output data-testid="draft">{JSON.stringify(values)}</output>
		</FormProvider>
	);
};
const draft = () =>
	JSON.parse(screen.getByTestId('draft').textContent) as PersonalFormValues & {
		description: string;
	};

it('renders initial data, the nine networks in original order and the avatar in the first section', () => {
	const { container } = render(<Harness />);
	expect(screen.getByLabelText('Никнейм')).toHaveValue(' Name ');
	expect(screen.getByLabelText('Локация')).toHaveValue('City');
	expect(screen.getByLabelText('GitHub')).toHaveValue('old github');
	expect(screen.getByLabelText('Email для связи')).toHaveValue(profile.email);
	expect(screen.getByLabelText('Email для связи')).toBeDisabled();
	expect(screen.getByRole('group', { name: 'IT специальность' })).toHaveAttribute(
		'aria-disabled',
		'true',
	);
	expect(screen.getByText('Frontend')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Сменить специальность' })).toHaveAttribute(
		'href',
		'/ru/settings#account',
	);
	expect(container.querySelector('form')).toBeNull();
	expect(container.querySelector('input[type="file"]')).toBeNull();
	const socialLabels = [...container.querySelectorAll('label')]
		.map((label) => label.textContent)
		.filter((text) =>
			[
				'Instagram',
				'LinkedIn',
				'Twitter',
				'Facebook',
				'GitHub',
				'Behance',
				'WhatsApp',
				'Telegram',
				'YouTube',
			].includes(text),
		);
	expect(socialLabels).toEqual([
		'Instagram',
		'LinkedIn',
		'Twitter',
		'Facebook',
		'GitHub',
		'Behance',
		'WhatsApp',
		'Telegram',
		'YouTube',
	]);
	expect(screen.getByTestId('avatar-slot').parentElement?.previousElementSibling).toBeNull();
	expect(screen.getByTestId('avatar-slot').previousElementSibling).toHaveTextContent(
		'Фото профиля',
	);
	expect(draft().socialNetwork.map((link) => link.code)).toEqual([...PERSONAL_SOCIAL_CODES]);
	expect(draft().socialNetwork.some((link) => (link.code as string) === 'legacy')).toBe(false);
	expect(new Set(draft().socialNetwork.map((link) => link.code)).size).toBe(9);
});
it('shows a localized empty specialization without a raw ID or editable options', () => {
	render(<Harness specialization={null} />);
	expect(screen.getByText('Специальность не выбрана')).toBeInTheDocument();
	expect(screen.queryByText('987654')).not.toBeInTheDocument();
	fireEvent.click(screen.getByTestId('dropdown-select'));
	expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
it('preserves whitespace, clears city and edits or clears social links through the shared context', () => {
	render(<Harness />);
	fireEvent.change(screen.getByLabelText('Никнейм'), { target: { value: ' New ' } });
	fireEvent.change(screen.getByLabelText('Локация'), { target: { value: '' } });
	fireEvent.change(screen.getByLabelText('GitHub'), { target: { value: '' } });
	fireEvent.change(screen.getByLabelText('Telegram'), {
		target: { value: 'not a URL and allowed' },
	});
	expect(draft()).toMatchObject({ username: ' New ', city: '', description: 'Other tab draft' });
	expect(toPersonalPayload(draft())).toEqual({
		username: ' New ',
		city: '',
		socialNetwork: [{ code: 'telegram', title: 'not a URL and allowed' }],
	});
	expect(fireEvent.keyDown(screen.getByLabelText('Никнейм'), { key: 'Enter' })).toBe(false);
});
it('renders RHF errors and error styling through FormControl', async () => {
	render(<Harness />);
	fireEvent.click(screen.getByText('Set field error'));
	await screen.findByText('Минимальная длина 2 символа');
	expect(screen.getByLabelText('Никнейм')).toHaveAttribute('aria-invalid', 'true');
});
it('keeps all draft values across unmounting the tab and reopening it', async () => {
	const { rerender } = render(<Harness />);
	fireEvent.change(screen.getByLabelText('Никнейм'), { target: { value: 'Unsaved' } });
	fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: 'draft link' } });
	rerender(<Harness visible={false} />);
	rerender(<Harness />);
	await waitFor(() => expect(screen.getByLabelText('Никнейм')).toHaveValue('Unsaved'));
	expect(screen.getByLabelText('Instagram')).toHaveValue('draft link');
	expect(draft().description).toBe('Other tab draft');
});
it('renders the slot unchanged and does not reset the draft when it updates', () => {
	const click = jest.fn();
	const { rerender, container } = render(
		<Harness
			avatar={
				<button type="button" data-marker="original" onClick={click}>
					Original avatar
				</button>
			}
		/>,
	);
	fireEvent.change(screen.getByLabelText('Никнейм'), { target: { value: 'Draft' } });
	fireEvent.click(screen.getByText('Original avatar'));
	expect(click).toHaveBeenCalledTimes(1);
	expect(screen.getByText('Original avatar')).toHaveAttribute('data-marker', 'original');
	rerender(
		<Harness
			data={{
				...profile,
				username: 'New backend name',
				avatarUrl: 'https://example.invalid/avatar',
			}}
			avatar={<div>Updated avatar</div>}
		/>,
	);
	expect(screen.getByText('Updated avatar')).toBeInTheDocument();
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Draft');
	expect(container.querySelectorAll('button[type="submit"]')).toHaveLength(0);
});
it('contains no upward imports, sibling feature imports, own form or reset', () => {
	const source = readFileSync(join(__dirname, 'EditPersonal.tsx'), 'utf8');
	expect(source).not.toMatch(/from ['"]@\/(app|widgets|features)\//);
	expect(source).not.toMatch(/\b(useForm|reset|fetch)\s*\(/);
	expect(source).not.toContain('AvatarEditor');
});

it('allows a keyboard selection only for an initially empty specialization', () => {
	const data = { ...profile, activeProfile: { ...profile.activeProfile, specializationId: 0 } };
	render(
		<Harness data={data} specialization={null} options={[{ id: 7, title: 'Backend developer' }]} />,
	);
	fireEvent.keyDown(screen.getByRole('button', { name: 'Выберите специализацию' }), {
		key: 'Enter',
	});
	fireEvent.keyDown(screen.getByRole('option', { name: 'Backend developer' }), { key: 'Enter' });
	expect(screen.getByText('Backend developer')).toBeInTheDocument();
	expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
it('shows an explicit directory error without selectable options', () => {
	render(
		<Harness
			data={{ ...profile, activeProfile: { ...profile.activeProfile, specializationId: 0 } }}
			optionsError
		/>,
	);
	expect(
		screen.getByText('Не удалось загрузить доступные специализации. Обновите страницу.'),
	).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Нет доступных опций' }));
	expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it.each([0, 987654])(
	'renders an accessible account link below specialization %s and before email',
	(specializationId) => {
		render(
			<Harness
				data={{ ...profile, activeProfile: { ...profile.activeProfile, specializationId } }}
				options={[{ id: 7, title: 'Backend developer' }]}
			/>,
		);
		const link = screen.getByRole('link', { name: 'Сменить специальность' });
		expect(link).toHaveAttribute('href', '/ru/settings#account');
		expect(screen.getAllByRole('link', { name: 'Сменить специальность' })).toHaveLength(1);
		const dropdown = screen.getAllByTestId('dropdown')[0];
		expect(dropdown.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(
			link.compareDocumentPosition(screen.getByLabelText('Email для связи')) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		link.focus();
		expect(link).toHaveFocus();
		fireEvent.click(link);
		expect(push).toHaveBeenCalledWith('/ru/settings#account', expect.anything());
	},
);
it('keeps the account link enabled when the specialization catalogue is unavailable', () => {
	render(
		<Harness
			data={{ ...profile, activeProfile: { ...profile.activeProfile, specializationId: 0 } }}
			optionsError
		/>,
	);
	const link = screen.getByRole('link', { name: 'Сменить специальность' });
	expect(link).not.toHaveAttribute('aria-disabled', 'true');
	fireEvent.click(link);
	expect(push).toHaveBeenCalled();
});
