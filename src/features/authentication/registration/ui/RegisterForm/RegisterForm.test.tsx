import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server.node';
import { FormProvider, useForm } from 'react-hook-form';
import type { ResolverResult } from 'react-hook-form';

import type { SignUpFormValues } from '@/entities/auth';

import { RegisterForm } from './RegisterForm';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('@/shared/libs', () => jest.requireActual('@/shared/libs/app/documents'));
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
const values: SignUpFormValues = {
	username: 'sample',
	email: 'sample@example.invalid',
	password: 'OriginalCASE1!',
	passwordConfirmation: 'OriginalCASE1!',
	privacyConsent: true,
	offerConsent: true,
	adConsent: false,
};
const Harness = ({
	onSubmit,
	error,
	valid = true,
}: {
	onSubmit?: (values: SignUpFormValues) => Promise<void>;
	error?: string;
	valid?: boolean;
}) => {
	const methods = useForm<SignUpFormValues>({
		defaultValues: values,
		resolver: (data): ResolverResult<SignUpFormValues> =>
			valid
				? { values: data, errors: {} }
				: {
						values: {},
						errors: { email: { type: 'validate', message: 'Неверный формат электронной почты' } },
					},
	});
	return (
		<FormProvider {...methods}>
			<RegisterForm onSubmit={onSubmit} error={error} />
		</FormProvider>
	);
};
const button = () => screen.getByRole('button', { name: 'Зарегистрироваться' });
const form = () => button().closest('form')!;
let write: jest.SpyInstance;
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
	fetchMock.mockReset();
	globalThis.fetch = fetchMock;
	write = jest.spyOn(Storage.prototype, 'setItem');
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	expect(write).not.toHaveBeenCalled();
	write.mockRestore();
	globalThis.fetch = originalFetch;
});
it('blocks submission without callback and cancels native navigation', async () => {
	render(<Harness />);
	await act(async () => {
		await Promise.resolve();
	});
	expect(button()).toBeDisabled();
	expect(form()).toHaveAttribute('method', 'post');
	expect(fireEvent.submit(form())).toBe(false);
	expect(window.location.search).toBe('');
});
it('submits valid exact values once', async () => {
	const submit = jest.fn().mockResolvedValue(undefined);
	render(<Harness onSubmit={submit} />);
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
	expect(submit).toHaveBeenCalledWith(values);
});
it('does not submit invalid RHF data', async () => {
	const submit = jest.fn();
	render(<Harness onSubmit={submit} valid={false} />);
	fireEvent.submit(form());
	expect(await screen.findByText('Неверный формат электронной почты')).toBeInTheDocument();
	expect(submit).not.toHaveBeenCalled();
});
it('blocks duplicate submit during pending and unlocks afterwards', async () => {
	let finish: (() => void) | undefined;
	const submit = jest.fn(
		() =>
			new Promise<void>((resolve) => {
				finish = resolve;
			}),
	);
	render(<Harness onSubmit={submit} />);
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.submit(form());
	fireEvent.submit(form());
	await waitFor(() => expect(button()).toHaveAttribute('aria-busy', 'true'));
	expect(button()).toBeDisabled();
	expect(submit).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.();
		await Promise.resolve();
	});
	await waitFor(() => expect(button()).toBeEnabled());
});
it('shows accessible external error', async () => {
	render(<Harness error="Безопасная ошибка" />);
	await act(async () => {
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toHaveTextContent('Безопасная ошибка');
});
it('handles rejection safely and retains passwords', async () => {
	render(<Harness onSubmit={jest.fn().mockRejectedValue(new Error('private details'))} />);
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось зарегистрироваться. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private details')).toBeNull();
	expect(document.querySelector('input[name="password"]')).toHaveValue(values.password);
	expect(document.querySelector('input[name="passwordConfirmation"]')).toHaveValue(
		values.passwordConfirmation,
	);
	await waitFor(() => expect(button()).toBeEnabled());
});
it('renders POST and a disabled submit before hydration including Enter fallback', () => {
	const container = document.createElement('div');
	container.innerHTML = renderToString(<Harness onSubmit={jest.fn()} />);
	expect(container.querySelector('form')).toHaveAttribute('method', 'post');
	expect(container.querySelector('button[type="submit"]')).toBeDisabled();
	expect(container.querySelector('form')).not.toHaveAttribute('action');
});
it('preserves all fields, consents and four document links', async () => {
	render(<Harness />);
	await act(async () => {
		await Promise.resolve();
	});
	expect(document.querySelectorAll('input')).toHaveLength(7);
	expect(screen.getAllByRole('checkbox')).toHaveLength(3);
	const links = screen.getAllByRole('link');
	expect(links).toHaveLength(4);
	for (const link of links) {
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		expect(link.getAttribute('href')).toMatch(/^https:\/\/docs.google.com\//);
	}
});
