'use client';

import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { EmailSendModal, ForgotPasswordForm } from '@/features/authentication/forgotPassword';
import { Auth, Translation, i18Namespace } from '@/shared/config';

import { createForgotPasswordSchema } from '../lib/validation/forgotPasswordSchema';

interface ForgotPasswordProps {
	sendEmailAction: (
		email: string,
	) => Promise<{ status: 'success' } | { status: 'validation-error' } | { status: 'error' }>;
	error?: string;
}

export const ForgotPassword = ({ sendEmailAction, error }: ForgotPasswordProps) => {
	const t = useTranslations(i18Namespace.translation);
	const tAuth = useTranslations(i18Namespace.auth);
	const [sendError, setSendError] = useState<string>();
	const [email, setEmail] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const active = useRef(false);
	const pending = useRef(false);
	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	const send = async (value: string): Promise<boolean> => {
		if (!active.current || pending.current) return false;
		pending.current = true;
		try {
			const result = await sendEmailAction(value);
			return active.current && result.status === 'success';
		} catch {
			return false;
		} finally {
			pending.current = false;
		}
	};
	const onSubmit = async (value: string) => {
		const success = await send(value);
		if (!active.current) return;
		if (success) {
			setEmail(value);
			setSendError(undefined);
			setIsOpen(true);
		} else setSendError(tAuth(Auth.FORGOT_PASSWORD_ERROR));
	};
	const onResend = () => (email ? send(email) : Promise.resolve(false));
	const schema = createForgotPasswordSchema({
		email: t(Translation.VALIDATION_EMAIL),
		required: t(Translation.VALIDATION_REQUIRED),
		maxEmailLength: t(Translation.VALIDATION_LENGTH_MAX, { count: 254 }),
	});
	const methods = useForm({
		defaultValues: { username: '' },
		mode: 'onTouched',
		resolver: yupResolver(schema),
	});

	return (
		<>
			<FormProvider {...methods}>
				<ForgotPasswordForm onSubmit={onSubmit} error={sendError || error} />
			</FormProvider>
			<EmailSendModal isOpen={isOpen} onClose={() => setIsOpen(false)} onResend={onResend} />
		</>
	);
};
