import { validateRegistration } from './registration';
import { authPageUrl, safeReturnUrl } from './session';

const valid = {
	username: 'LocalUser',
	email: 'user@local.invalid',
	password: 'StrongPass1!',
	passwordConfirmation: 'StrongPass1!',
	privacyConsent: true,
	offerConsent: true,
	adConsent: false,
};
it('сохраняет React validation, trim имени и необязательность рассылки', () => {
	const result = validateRegistration({
		...valid,
		username: '  LocalUser  ',
		adConsent: undefined,
		roles: ['admin'],
	});
	expect(result.errors).toEqual({});
	expect(result.values?.username).toBe('LocalUser');
	expect(result.values?.adConsent).toBe(false);
	expect(result.values).not.toHaveProperty('roles');
});
it.each([
	['username', 'x', 'usernameInvalid'],
	['username', 'x'.repeat(31), 'usernameInvalid'],
	['email', 'invalid', 'emailInvalid'],
	['password', 'weak', 'passwordInvalid'],
	['password', 'strongpass1!', 'passwordInvalid'],
	['password', 'STRONGPASS1!', 'passwordInvalid'],
	['password', 'StrongPass!!', 'passwordInvalid'],
	['password', 'StrongPass11', 'passwordInvalid'],
	['password', 'Aa1!' + 'x'.repeat(252), 'passwordInvalid'],
	['passwordConfirmation', 'Different1!', 'passwordMismatch'],
	['privacyConsent', false, 'consentRequired'],
	['offerConsent', false, 'consentRequired'],
	['privacyConsent', 'true', 'consentRequired'],
	['adConsent', 'true', 'consentInvalid'],
])('отклоняет %s=%s', (field, value, error) => {
	const result = validateRegistration({ ...valid, [field]: value });
	expect(result.values).toBeNull();
	expect(result.errors).toMatchObject({ [field]: error });
});
it.each([null, [], 'invalid', undefined])('не принимает malformed body %s', (body) => {
	expect(validateRegistration(body).values).toBeNull();
});
it('сохраняет разрешённый optional refId', () => {
	expect(validateRegistration({ ...valid, refId: 'LOCAL-REF' }).values?.refId).toBe('LOCAL-REF');
	expect(validateRegistration({ ...valid, refId: {} }).values).toBeNull();
});
it('login/register сохраняют безопасный returnPage с query/hash', () => {
	const target = '/ru/questions/react/example?page=2#answer';
	for (const page of ['login', 'register'] as const) {
		const link = new URL(authPageUrl(page, target), 'http://localhost:3000');
		expect(link.pathname).toBe(`/ru/auth/${page}`);
		expect(safeReturnUrl(link.searchParams.get('returnPage'))).toBe(target);
	}
});
it.each(['https://evil.invalid', '//evil.invalid', '/ru/auth/register', '/ru/%61uth/register'])(
	'auth links отвергают unsafe returnPage %s',
	(value) => {
		expect(authPageUrl('register', value)).toBe('/ru/auth/register');
		expect(authPageUrl('login', value)).toBe('/ru/auth/login');
	},
);

it('возвращает на локализованную главную без потери query/hash', () => {
	const target = '/ru?from=registration#top';
	expect(safeReturnUrl(target)).toBe(target);
	expect(
		new URL(authPageUrl('register', target), 'http://localhost:3000').searchParams.get(
			'returnPage',
		),
	).toBe(target);
});
it('расширение для главной не разрешает похожие префиксы или auth parent', () => {
	expect(safeReturnUrl('/ruevil/questions')).toBe('/ru/auth/login');
	expect(safeReturnUrl('/ru/auth')).toBe('/ru/auth/login');
});
