/** @jest-environment jsdom */
import { Fragment, ReactNode } from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import messages from '../../../../public/locales/ru/auth.json';

const { registrationFormErrors } = jest.requireActual<
	typeof import('../../../features/authentication/register/model/validation')
>('../../../features/authentication/register/model/validation');

const router = { replace: jest.fn(), refresh: jest.fn() };
const translate = Object.assign(
	(key: string) => {
		const value = messages[key as keyof typeof messages];
		return typeof value === 'string' ? value : key;
	},
	{
		rich: (key: string, links: Record<string, (chunks: ReactNode) => ReactNode>) => {
			const value = messages[key as keyof typeof messages] as string;
			return value.split(/(<[a-z]+>.*?<\/[a-z]+>)/g).map((part, index) => {
				const match = part.match(/^<([a-z]+)>(.*?)<\/[a-z]+>$/);
				return <Fragment key={index}>{match ? links[match[1]](match[2]) : part}</Fragment>;
			});
		},
	},
);
jest.mock('next/navigation', () => ({ useRouter: () => router }));
jest.mock('next-intl', () => ({
	useTranslations: () => translate,
}));
jest.mock('@/entities/session', () => ({
	...jest.requireActual<typeof import('../index')>('../index'),
	restoreSession: jest.fn(),
	registerAccount: jest.fn(),
}));
const api: jest.Mocked<typeof import('../index')> = jest.requireMock('@/entities/session');
const { Registration } = jest.requireActual<
	typeof import('../../../features/authentication/register/ui/Registration')
>('../../../features/authentication/register/ui/Registration');
const valid = {
	username: 'LocalUser',
	email: 'user@local.invalid',
	password: 'StrongPass1!',
	passwordConfirmation: 'StrongPass1!',
	privacyConsent: true,
	offerConsent: true,
	adConsent: false,
};
beforeEach(() => {
	jest.clearAllMocks();
	api.restoreSession.mockResolvedValue(null);
});
afterEach(cleanup);
it.each([
	['username', '', 'registrationRequired'],
	['username', 'x', 'registrationNameMin'],
	['username', 'x'.repeat(31), 'registrationNameMax'],
	['email', '', 'registrationRequired'],
	['email', 'bad', 'loginEmailInvalid'],
	['password', '', 'registrationRequired'],
	['password', 'short', 'registrationPasswordMin'],
	['password', 'lowercase1!', 'registrationPasswordWeak'],
	['password', 'Aa1!' + 'x'.repeat(252), 'registrationPasswordMax'],
	['passwordConfirmation', '', 'registrationRequired'],
	['passwordConfirmation', 'OtherPass1!', 'passwordMismatch'],
	['privacyConsent', false, 'consentRequired'],
	['offerConsent', false, 'consentRequired'],
])('сохраняет React messages и AUTH-02 limits: %s', (field, value, error) => {
	expect(registrationFormErrors({ ...valid, [field]: value })).toMatchObject({ [field]: error });
});
it('confirmation проверяется на strength, рассылка необязательна', () => {
	expect(registrationFormErrors(valid)).toEqual({});
	expect(
		registrationFormErrors({ ...valid, password: 'weak', passwordConfirmation: 'weak' }),
	).toMatchObject({
		password: 'registrationPasswordMin',
		passwordConfirmation: 'registrationPasswordMin',
	});
});
it('восстанавливает source тексты/placeholder/order, 4 документа внутри согласий, link не переключает checkbox', async () => {
	render(<Registration returnPage="/ru/questions/react/example?page=2#answer" />);
	const name = screen.getByLabelText<HTMLInputElement>('Никнейм');
	await waitFor(() => expect(name.disabled).toBe(false));
	expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeTruthy();
	expect(screen.getByPlaceholderText('Введите никнейм')).toBe(name);
	expect(screen.getByPlaceholderText('Введите электронную почту')).toBeTruthy();
	expect(screen.getAllByPlaceholderText('Введите пароль')).toHaveLength(2);
	const checkbox = screen.getByRole<HTMLInputElement>('checkbox', {
		name: /Даю согласие на обработку ПД/,
	});
	expect(checkbox.required).toBe(true);
	const ad = screen.getByRole<HTMLInputElement>('checkbox', {
		name: /рекламных и информационных рассылок/,
	});
	expect(ad.required).toBe(false);
	expect(ad.checked).toBe(false);
	const docs = [
		['обработку ПД', '19JvySToaMm3pkohGkHwqhJjGl3IzldIc3qnQpAoVFVc'],
		['Политикой в отношении ПД', '1OX9Fc3HPhjL_U9xkF2P3vsSmM1fAdhmQ88J2NT0emFo'],
		['Договором-офертой', '1tU9lgOu_W21DAoHOH0kQmTWq5hG3rvxv_Q_jzRi8Gh4'],
		[
			'согласие на получение рекламных и информационных рассылок',
			'1SaCHcZZhb9da-yOePEur3wv2C47ie2R8rPnkkxrxPqA',
		],
	];
	for (const [title, id] of docs) {
		const link = screen.getByRole('link', { name: title });
		expect(link.getAttribute('href')).toContain(
			`https://docs.google.com/document/d/${id}/edit?tab=t.0`,
		);
		expect(link.getAttribute('target')).toBe('_blank');
		fireEvent.click(link);
	}
	expect(checkbox.checked).toBe(false);
	expect(screen.getByRole<HTMLInputElement>('checkbox', { name: /Я подтверждаю/ }).checked).toBe(
		false,
	);
	expect(ad.checked).toBe(false);
	const submit = screen.getByRole<HTMLButtonElement>('button', { name: 'Зарегистрироваться' });
	expect(submit.disabled).toBe(true);
	expect(submit.compareDocumentPosition(checkbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	expect(screen.getByText('Уже есть аккаунт?')).toBeTruthy();
	expect(screen.getByRole('link', { name: 'Войти' }).getAttribute('href')).toBe(
		'/ru/auth/login?returnPage=%2Fru%2Fquestions%2Freact%2Fexample%3Fpage%3D2%23answer',
	);
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Telegram' }).disabled).toBe(true);
	expect(api.registerAccount).not.toHaveBeenCalled();
});
it('onTouched errors обновляются при вводе и изменении исходного пароля', async () => {
	render(<Registration />);
	const name = screen.getByLabelText<HTMLInputElement>('Никнейм');
	await waitFor(() => expect(name.disabled).toBe(false));
	expect(screen.queryByText('Это поле обязательно для заполнения')).toBeNull();
	fireEvent.blur(name);
	expect(screen.getByText('Это поле обязательно для заполнения')).toBeTruthy();
	fireEvent.change(name, { target: { value: 'x' } });
	expect(screen.getByText('Минимальная длина 2 символа')).toBeTruthy();
	fireEvent.change(name, { target: { value: 'Valid' } });
	expect(screen.queryByText('Минимальная длина 2 символа')).toBeNull();
	const email = screen.getByLabelText('Электронная почта');
	fireEvent.change(email, { target: { value: 'bad' } });
	fireEvent.blur(email);
	expect(screen.getByText('Неверный формат электронной почты')).toBeTruthy();
	const password = screen.getByLabelText('Пароль', { exact: true });
	const confirmation = screen.getByLabelText('Подтвердить пароль');
	fireEvent.change(password, { target: { value: 'StrongPass1!' } });
	fireEvent.change(confirmation, { target: { value: 'StrongPass1!' } });
	fireEvent.blur(confirmation);
	fireEvent.change(password, { target: { value: 'AnotherPass1!' } });
	expect(screen.getByText('Пароли должны совпадать')).toBeTruthy();
	const consent = screen.getByRole('checkbox', { name: /Даю согласие на обработку ПД/ });
	fireEvent.blur(consent);
	expect(screen.getByText('Вы должны согласиться с настоящими правилами и условиями')).toBeTruthy();
	fireEvent.click(consent);
	expect(screen.queryByText('Вы должны согласиться с настоящими правилами и условиями')).toBeNull();
});
