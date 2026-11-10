import { yupResolver } from '@hookform/resolvers/yup';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { PasswordRecoveryForm } from './PasswordRecoveryForm';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
const passwordRules: RegExp = jest.requireActual('@/shared/libs/app/regexp').passwordRules;
// Feature tests cannot import the widget schema. Use real Yup and the shared password rule.
const password = yup
	.string()
	.required('Обязательное поле')
	.min(8)
	.max(255)
	.matches(passwordRules, 'Слабый пароль');
const schema = yup.object({
	password,
	confirmPassword: password.oneOf([yup.ref('password')], 'Пароли должны совпадать'),
});
const Harness = ({
	onSubmit,
	error,
	validate = true,
}: {
	onSubmit: (password: string, confirmPassword: string) => Promise<void>;
	error?: string | null;
	validate?: boolean;
}) => {
	const methods = useForm({
		defaultValues: { password: '', confirmPassword: '' },
		mode: 'onTouched',
		resolver: validate ? yupResolver(schema) : undefined,
	});
	return (
		<FormProvider {...methods}>
			<PasswordRecoveryForm onSubmit={onSubmit} error={error} />
		</FormProvider>
	);
};
const fields = () => screen.getAllByPlaceholderText('Пароль');
const button = () => screen.getByRole('button', { name: 'Сохранить' });
const fill = (a = 'OriginalCASE1!', b = a) => {
	[a, b].forEach((value, i) => {
		fireEvent.change(fields()[i], { target: { value } });
		fireEvent.blur(fields()[i]);
	});
};
let fetchMock: jest.Mock;
let write: jest.SpyInstance;
let read: jest.SpyInstance;
const originalFetch = globalThis.fetch;
beforeEach(() => {
	fetchMock = jest.fn();
	globalThis.fetch = fetchMock;
	write = jest.spyOn(Storage.prototype, 'setItem');
	read = jest.spyOn(Storage.prototype, 'getItem');
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	expect(write).not.toHaveBeenCalled();
	expect(read).not.toHaveBeenCalled();
	write.mockRestore();
	read.mockRestore();
	globalThis.fetch = originalFetch;
});
it('renders password fields and localized labels', () => {
	render(<Harness onSubmit={jest.fn()} />);
	expect(screen.getByText('Введите новый пароль')).toBeInTheDocument();
	expect(screen.getByText('Повторите пароль')).toBeInTheDocument();
	expect(fields()).toHaveLength(2);
	for (const field of fields()) expect(field).toHaveAttribute('type', 'password');
	expect(button()).toBeDisabled();
});
it('shows RHF errors and does not submit invalid values', async () => {
	const submit = jest.fn();
	render(<Harness onSubmit={submit} />);
	fill('OriginalCASE1!', 'DifferentCASE1!');
	expect(await screen.findByText('Пароли должны совпадать')).toBeInTheDocument();
	fireEvent.submit(button().closest('form')!);
	await waitFor(() => expect(button()).toBeDisabled());
	expect(submit).not.toHaveBeenCalled();
});
it('submits the original case and exact field values', async () => {
	const submit = jest.fn().mockResolvedValue(undefined);
	render(<Harness onSubmit={submit} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledWith('OriginalCASE1!', 'OriginalCASE1!'));
});
it('does not normalize passwords at the callback boundary', async () => {
	const submit = jest.fn().mockResolvedValue(undefined);
	render(<Harness onSubmit={submit} validate={false} />);
	fill(' OriginalCASE1! ');
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledWith(' OriginalCASE1! ', ' OriginalCASE1! '));
});
it('preserves spaces and rejects them under real Yup rules', async () => {
	const submit = jest.fn();
	render(<Harness onSubmit={submit} />);
	fill(' OriginalCASE1! ');
	await waitFor(() => expect(button()).toBeDisabled());
	expect(fields()[0]).toHaveValue(' OriginalCASE1! ');
	expect(submit).not.toHaveBeenCalled();
});
it('blocks duplicate submits while pending', async () => {
	let finish: (() => void) | undefined;
	const submit = jest.fn(
		() =>
			new Promise<void>((resolve) => {
				finish = resolve;
			}),
	);
	render(<Harness onSubmit={submit} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.submit(button().closest('form')!);
	fireEvent.submit(button().closest('form')!);
	await waitFor(() => expect(button()).toHaveAttribute('aria-busy', 'true'));
	expect(button()).toBeDisabled();
	expect(submit).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.();
		await Promise.resolve();
	});
	await waitFor(() => expect(button()).toBeEnabled());
});
it('shows a parent error separately from field errors', () => {
	render(<Harness onSubmit={jest.fn()} error="Безопасная ошибка" />);
	expect(screen.getByRole('alert')).toHaveTextContent('Безопасная ошибка');
});
it('handles rejected callback safely', async () => {
	render(<Harness onSubmit={jest.fn().mockRejectedValue(new Error('private details'))} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось изменить пароль. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private details')).toBeNull();
	await waitFor(() => expect(button()).toBeEnabled());
});
