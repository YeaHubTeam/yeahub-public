import { yupResolver } from '@hookform/resolvers/yup';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { ForgotPasswordForm } from './ForgotPasswordForm';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => (key: string) => {
		let value: unknown = jest.requireActual(`public/locales/ru/${namespace}.json`);
		for (const part of key.split('.')) value = Reflect.get(value as object, part);
		return value;
	},
}));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
const rule: RegExp = jest.requireActual('@/shared/libs/app/regexp').emailRule;
const schema = yup.object({
	username: yup
		.string()
		.trim()
		.matches(rule, { message: 'Неверный формат электронной почты', excludeEmptyString: true })
		.max(254)
		.required('Это поле обязательно для заполнения'),
});
const Harness = ({
	onSubmit,
	error,
}: {
	onSubmit: (email: string) => Promise<void>;
	error?: string;
}) => {
	const methods = useForm({
		defaultValues: { username: '' },
		resolver: yupResolver(schema),
		mode: 'onTouched',
	});
	return (
		<FormProvider {...methods}>
			<ForgotPasswordForm onSubmit={onSubmit} error={error} />
		</FormProvider>
	);
};
const input = () => screen.getByPlaceholderText('Введите электронную почту');
const button = () => screen.getByRole('button', { name: 'Отправить' });
const fill = async (value = 'test@example.invalid') => {
	fireEvent.change(input(), { target: { value } });
	fireEvent.blur(input());
	await waitFor(() => expect(button()).toBeEnabled());
};
it('starts disabled and shows localized label', () => {
	render(<Harness onSubmit={jest.fn()} />);
	expect(button()).toBeDisabled();
	expect(screen.getByText('Электронная почта')).toBeInTheDocument();
});
it.each([
	['invalid', 'Неверный формат электронной почты'],
	['   ', 'Это поле обязательно для заполнения'],
])('shows validation for case %#', async (value, message) => {
	render(<Harness onSubmit={jest.fn()} />);
	fireEvent.change(input(), { target: { value } });
	fireEvent.blur(input());
	expect(await screen.findByText(message)).toBeInTheDocument();
	expect(button()).toBeDisabled();
});
it('trims on blur and submits normalized email', async () => {
	const submit = jest.fn().mockResolvedValue(undefined);
	render(<Harness onSubmit={submit} />);
	await fill(' test@example.invalid ');
	expect(input()).toHaveValue('test@example.invalid');
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledWith('test@example.invalid'));
});
it('blocks repeated submissions while pending', async () => {
	let finish: (() => void) | undefined;
	const submit = jest.fn(
		() =>
			new Promise<void>((resolve) => {
				finish = resolve;
			}),
	);
	render(<Harness onSubmit={submit} />);
	await fill();
	const form = button().closest('form')!;
	fireEvent.submit(form);
	fireEvent.submit(form);
	await waitFor(() => expect(button()).toHaveAttribute('aria-busy', 'true'));
	expect(button()).toBeDisabled();
	expect(submit).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.();
		await Promise.resolve();
	});
	await waitFor(() => expect(button()).toBeEnabled());
});
it('shows parent error', () => {
	render(<Harness onSubmit={jest.fn()} error="Безопасная ошибка" />);
	expect(screen.getByRole('alert')).toHaveTextContent('Безопасная ошибка');
});
it('handles rejection without exposing technical details', async () => {
	render(<Harness onSubmit={jest.fn().mockRejectedValue(new Error('private-details'))} />);
	await fill();
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось отправить письмо. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private-details')).not.toBeInTheDocument();
	await waitFor(() => expect(button()).toBeEnabled());
});
