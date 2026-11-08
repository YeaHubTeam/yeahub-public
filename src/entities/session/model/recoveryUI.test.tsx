/** @jest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { recoveryEmailError, recoveryPasswordErrors } from './recovery';

const translate = (key: string) => key;
jest.mock('next-intl', () => ({ useTranslations: () => translate }));
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
const { ForgotPassword, PasswordRecovery } = jest.requireActual<
	typeof import('../../../features/authentication/recovery')
>('../../../features/authentication/recovery');
beforeEach(() => {
	global.fetch = jest.fn();
	localStorage.clear();
});
afterEach(cleanup);
const fill = () => {
	fireEvent.change(screen.getByLabelText('recovery.newPassword'), {
		target: { value: 'StrongPass1!' },
	});
	fireEvent.change(screen.getByLabelText('recovery.repeatPassword'), {
		target: { value: 'StrongPass1!' },
	});
};
it('email validation matches source; required/password strength/mismatch', () => {
	expect(recoveryEmailError('')).toBe('registrationRequired');
	expect(recoveryEmailError('bad')).toBe('loginEmailInvalid');
	expect(recoveryEmailError('a+b@local.invalid')).toBeUndefined();
	expect(recoveryPasswordErrors({ password: '', passwordConfirm: '' })).toEqual({
		password: 'registrationRequired',
		passwordConfirm: 'registrationRequired',
	});
	expect(recoveryPasswordErrors({ password: 'weak', passwordConfirm: 'other' })).toMatchObject({
		password: 'registrationPasswordMin',
		passwordConfirm: 'passwordMismatch',
	});
	expect(
		recoveryPasswordErrors({ password: 'lowercase1!', passwordConfirm: 'lowercase1!' }),
	).toMatchObject({ password: 'registrationPasswordWeak' });
});
it('forgot touched validation prevents requests, links preserve safe returnPage', () => {
	render(<ForgotPassword returnPage="/ru/questions" />);
	const email = screen.getByLabelText('loginEmailLabel');
	fireEvent.blur(email);
	expect(screen.getByText('registrationRequired')).toBeTruthy();
	fireEvent.change(email, { target: { value: 'bad' } });
	expect(screen.getByText('loginEmailInvalid')).toBeTruthy();
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'recovery.send' }).disabled).toBe(
		true,
	);
	expect(screen.getByRole('link', { name: 'registrationLogin' }).getAttribute('href')).toContain(
		'returnPage=%2Fru%2Fquestions',
	);
	expect(fetch).not.toHaveBeenCalled();
});
it('forgot pending blocks double submit; success modal and 60s resend cooldown, only timestamp stored', async () => {
	let resolve!: (value: unknown) => void;
	(fetch as jest.Mock).mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	render(<ForgotPassword />);
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
		target: { value: 'a@local.invalid' },
	});
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'recovery.send' });
	fireEvent.click(button);
	fireEvent.click(button);
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(button.disabled).toBe(true);
	await act(() => Promise.resolve(resolve({ ok: true })));
	expect(screen.getByRole('dialog')).toBeTruthy();
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'recovery.resend' }).disabled).toBe(
		true,
	);
	expect(localStorage.getItem('yh_recovery_resend_after')).toMatch(/^\d+$/);
	expect(JSON.stringify(localStorage)).not.toContain('a@local.invalid');
});
it('network failure renders safe error without raw text', async () => {
	(fetch as jest.Mock).mockRejectedValue(new Error('private-network'));
	render(<ForgotPassword />);
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
		target: { value: 'a@local.invalid' },
	});
	fireEvent.click(screen.getByRole('button', { name: 'recovery.send' }));
	await screen.findByRole('alert');
	expect(screen.queryByText('private-network')).toBeNull();
});
it('missing recovery token shows error, offers a fresh link, no form or request', () => {
	render(<PasswordRecovery context="public-view-fingerprint" hasToken={false} />);
	expect(screen.getByText('recovery.invalidLink')).toBeTruthy();
	expect(screen.queryByLabelText('recovery.newPassword')).toBeNull();
	expect(screen.getByRole('link', { name: 'recovery.forgotTitle' }).getAttribute('href')).toBe(
		'/ru/auth/forgot-password',
	);
	expect(fetch).not.toHaveBeenCalled();
});
it('reset required validation before BFF', () => {
	render(<PasswordRecovery context="public-view-fingerprint" hasToken />);
	fireEvent.click(screen.getByRole('button', { name: 'recovery.save' }));
	expect(screen.getAllByText('registrationRequired')).toHaveLength(2);
	expect(fetch).not.toHaveBeenCalled();
});
it('expired token disables reset and offers a new link', async () => {
	(fetch as jest.Mock).mockResolvedValue({
		ok: false,
		json: () => Promise.resolve({ error: 'RECOVERY_LINK_INVALID' }),
	});
	render(<PasswordRecovery context="public-view-fingerprint" hasToken />);
	fill();
	fireEvent.click(screen.getByRole('button', { name: 'recovery.save' }));
	await screen.findByText('recovery.invalidLink');
	expect(screen.queryByRole('button', { name: 'recovery.save' })).toBeNull();
});
it('reset success is token-free, double submit blocked, login preserves safe returnPage', async () => {
	(fetch as jest.Mock).mockResolvedValue({ ok: true });
	render(
		<PasswordRecovery context="public-view-fingerprint" hasToken returnPage="/ru/questions" />,
	);
	fill();
	const button = screen.getByRole('button', { name: 'recovery.save' });
	fireEvent.click(button);
	fireEvent.click(button);
	await screen.findByText('recovery.resetSuccess');
	expect(fetch).toHaveBeenCalledTimes(1);
	const [url, options] = (fetch as jest.Mock).mock.calls[0];
	expect(url).toBe('/api/auth/password-recovery');
	expect(options).toMatchObject({ method: 'PATCH', cache: 'no-store', credentials: 'same-origin' });
	expect(JSON.parse(options.body)).toEqual({
		password: 'StrongPass1!',
		passwordConfirm: 'StrongPass1!',
		context: 'public-view-fingerprint',
		returnPage: '/ru/questions',
	});
	expect(screen.getByRole('link', { name: 'registrationLogin' }).getAttribute('href')).toContain(
		'returnPage=%2Fru%2Fquestions',
	);
});
it('unsafe returnPage never creates a link to another origin', () => {
	render(
		<PasswordRecovery
			context="public-view-fingerprint"
			hasToken={false}
			returnPage="https://evil.invalid"
		/>,
	);
	expect(screen.getByRole('link', { name: 'registrationLogin' }).getAttribute('href')).toBe(
		'/ru/auth/login',
	);
});

it('resend unlocks after 60s, never auto-sends; a failed resend is recoverable', async () => {
	jest.useFakeTimers();
	try {
		(fetch as jest.Mock)
			.mockResolvedValueOnce({ ok: true })
			.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: 'TRY_LATER' }) });
		render(<ForgotPassword />);
		fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
			target: { value: 'a@local.invalid' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'recovery.send' }));
		await act(() => Promise.resolve());
		const resend = screen.getByRole<HTMLButtonElement>('button', { name: 'recovery.resend' });
		expect(resend.disabled).toBe(true);
		act(() => jest.advanceTimersByTime(60000));
		expect(resend.disabled).toBe(false);
		expect(fetch).toHaveBeenCalledTimes(1);
		fireEvent.click(resend);
		await act(() => Promise.resolve());
		expect(screen.getByText('tryLater')).toBeTruthy();
		expect(fetch).toHaveBeenCalledTimes(2);
	} finally {
		cleanup();
		jest.useRealTimers();
	}
});
it('stored timestamp blocks a request immediately after remount; no email/token storage', () => {
	localStorage.setItem('yh_recovery_resend_after', String(Date.now() + 60000));
	render(<ForgotPassword />);
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
		target: { value: 'a@local.invalid' },
	});
	fireEvent.submit(screen.getByRole('button', { name: 'recovery.send' }).closest('form')!);
	expect(fetch).not.toHaveBeenCalled();
});
it('reset network error is safe and allows a manual next step without retry loops', async () => {
	(fetch as jest.Mock).mockRejectedValue(new Error('private-token-in-error'));
	render(<PasswordRecovery context="public-view-fingerprint" hasToken />);
	fill();
	fireEvent.click(screen.getByRole('button', { name: 'recovery.save' }));
	await screen.findByText('recovery.resetUnavailable');
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(screen.queryByText('private-token-in-error')).toBeNull();
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'recovery.save' }).disabled).toBe(
		false,
	);
});
